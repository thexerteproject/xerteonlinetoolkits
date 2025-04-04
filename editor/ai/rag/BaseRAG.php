<?php

namespace rag;
use DocumentLoaderFactory;

abstract class BaseRAG
{
    protected $fileType;
    protected $chunkSize;
    protected $encodingDirectory;
    protected $chunksFile;
    protected $embeddingsFile;
    protected $idfFile;
    protected $corpusFile;
    protected $tfidfFile;

    public function __construct($chunkSize = 2048, $fileType, $encodingDirectory)
    {
        $this->chunkSize = $chunkSize;
        require_once(str_replace('\\', '/', __DIR__) . "/TextSplitter.php");
        $this->fileType = $fileType;
        require_once(str_replace('\\', '/', __DIR__) . "/DocumentLoaders.php");

        // Ensure the base directory exists
        if (!is_dir($encodingDirectory)) {
            echo("Encoding directory not found: {$encodingDirectory}");
        }

        // Define the RAG folder within the encoding directory
        $this->encodingDirectory = rtrim($encodingDirectory, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'RAG' . DIRECTORY_SEPARATOR;

        // If the RAG folder doesn't exist, create it
        if (!is_dir($this->encodingDirectory)) {
            mkdir($this->encodingDirectory, 0777, true);
        }

        // Set file paths
        $this->chunksFile = $this->encodingDirectory . 'chunks.json';
        $this->embeddingsFile = $this->encodingDirectory . 'embeddings.json';
        $this->idfFile = $this->encodingDirectory . 'idf.json';
        $this->tfidfFile = $this->encodingDirectory . 'tfidf.json';
        $this->corpusFile = $this->encodingDirectory . 'corpus.json';
    }

    /**
     * processDirectory
     * ----------------
     * Processes all files in the given directory:
     *   - For each file, it calls processFileChunks (which checks against corpus.json)
     *   - Then, it processes new embeddings from any new chunks
     *   - Finally, it re-computes the TF-IDF vectors for the updated corpus.
     *
     * @param string $directory The directory containing the corpus files.
     */
    public function processDirectory($directory)
    {
        // Get all files in the directory (ignoring . and ..)
        $files = array_filter(scandir($directory), function ($item) use ($directory) {
            return is_file($directory . '/' . $item);
        });

        if (!empty($files)) {
            // Process each file individually.
            foreach ($files as $file) {
                $filePath = rtrim($directory, '/') . '/' . $file;
                $this->processFileChunks($filePath);
            }

            // Process new embeddings for any new chunks from unprocessed files.
            $this->processNewEmbeddings();

            // Recompute TF-IDF for the entire corpus.
            $this->generateTfidfPersistent();
        }
    }

    /**
     * updateGlobalCorpus
     * -------------------
     * Checks if a file (by its name) is already present in the global corpus
     * (stored in corpus.json). If not, it adds the file name to the corpus.
     *
     * @param string $fileName The name of the file to check.
     * @param string $autoAdd Determines whether file should be added to corpus if not present (default: false).
     * @return bool Returns true if the file was already processed; false otherwise.
     */
    protected function updateGlobalCorpus($fileName, $autoAdd = false)
    {
        $corpus = ["files" => []];
        if (file_exists($this->corpusFile)) {
            $content = file_get_contents($this->corpusFile);
            $corpus = json_decode($content, true) ?: $corpus;
        }
        if (!in_array($fileName, $corpus['files'])) {
            $corpus['files'][] = $fileName;
            if ($autoAdd) {
                file_put_contents($this->corpusFile, json_encode($corpus));
            }
            return false; // File was not previously processed.
        }
        return true; // File is already in the corpus.
    }

    /**
     * processFileChunks
     * -----------------
     * Processes a single file by:
     *   - Checking if its extension is supported (using a predefined list).
     *   - If the file is a plain text file, it uses streaming to read and split the file.
     *   - For other supported types, it uses DocumentLoaderFactory to load the full content
     *     and then uses the text splitter (splitTextByFileType) to produce chunks.
     *   - The resulting chunks are appended to the global chunks file.
     *
     * @param string $filePath The path to the file.
     */
    public function processFileChunks($filePath)
    {
        $fileName = basename($filePath);
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        // Define supported file types.
        $supported = ['txt', 'text', 'html', 'htm', 'csv', 'xml', 'docx', 'odt', 'pptx' ,'xlsx', 'md', 'markdown', 'pdf'];
        if (!in_array($extension, $supported)) {
            echo "Skipping unsupported file type: {$fileName}\n";
            return;
        }

        // Check if file is already processed using the global corpus.
        if ($this->updateGlobalCorpus($fileName)) {
            echo "File {$fileName} already processed for chunks.\n";
            return;
        }

        // Open the chunks file in append mode.
        $outHandle = fopen($this->chunksFile, 'a');
        if (!$outHandle) {
            echo("Error opening file for writing chunks: {$this->chunksFile}");
        }

        // For plain text files, use streaming.
        if ($extension === 'txt' || $extension === 'text') {
            $inHandle = fopen($filePath, 'r');
            if (!$inHandle) {
                fclose($outHandle);
                echo("Error opening file for reading: {$filePath}");
            }
            $buffer = "";
            $chunkIndex = time();
            while (!feof($inHandle)) {
                $buffer .= fread($inHandle, 4096);
                while (strlen($buffer) >= $this->chunkSize) {
                    $chunkText = substr($buffer, 0, $this->chunkSize);
                    $data = [
                        'id' => $fileName . '-' . $chunkIndex++,
                        'file' => $fileName,
                        'chunk' => $chunkText
                    ];
                    fwrite($outHandle, json_encode($data) . "\n");
                    $buffer = substr($buffer, $this->chunkSize);
                }
            }
            if (strlen($buffer) > 0) {
                $data = [
                    'id' => $fileName . '-' . $chunkIndex++,
                    'file' => $fileName,
                    'chunk' => $buffer
                ];
                fwrite($outHandle, json_encode($data) . "\n");
            }
            fclose($inHandle);
        } else {
            // For non-txt files, use DocumentLoader to load full content.
            try {
                $loader = DocumentLoaderFactory::getLoader($filePath);
                $content = $loader->load();
            } catch (Exception $e) {
                echo "Error loading file {$fileName}: " . $e->getMessage() . "\n";
                fclose($outHandle);
                return;
            }

            // Use text splitter function to split the loaded content.
            $chunksArr = splitTextByFileType($content, $extension, $this->chunkSize);
            $chunkIndex = time();
            foreach ($chunksArr as $chunk) {
                $data = [
                    'id' => $fileName . '-' . $chunkIndex++,
                    'file' => $fileName,
                    'chunk' => $chunk
                ];
                if (($encoded = json_encode($data, JSON_INVALID_UTF8_SUBSTITUTE)) === false) {
                    echo("JSON encode failed: " . json_last_error_msg());
                } else {
                    fwrite($outHandle, $encoded . "\n");
                }
            }
        }

        fclose($outHandle);
        $this->updateGlobalCorpus($fileName, true);
        echo "Processed chunks for {$fileName}.\n";
    }

    /**
     * processMultipleFilesChunks
     * ----------------------------
     * Processes an array of file paths by calling processFileChunks for each file.
     *
     * @param array $filePaths Array of file paths to process.
     */
    public function processMultipleFilesChunks(array $filePaths)
    {
        foreach ($filePaths as $filePath) {
            $this->processFileChunks($filePath);
        }
    }

    /**
     * processNewEmbeddings
     * ---------------------
     * Scans the chunks file for chunks from files that have not yet been embedded.
     * Processes embeddings in batches (using getEmbeddings) and appends the results
     * to the embeddings file (default: 'embeddings.json').
     *
     *
     * @param int $batchSize Number of chunks to process in a single batch (default: 10).
     */
    public function processNewEmbeddings($batchSize = 10)
    {
        $newChunks = [];
        $existingFiles = [];
        // If embeddings file exists, gather list of files already embedded.
        if (file_exists($this->embeddingsFile)) {
            $handle = fopen($this->embeddingsFile, 'r');
            while (($line = fgets($handle)) !== false) {
                $data = json_decode($line, true);
                if ($data && !in_array($data['file'], $existingFiles)) {
                    $existingFiles[] = $data['file'];
                }
            }
            fclose($handle);
        }
        // Scan chunks file for chunks belonging to files not yet embedded.
        $handle = fopen($this->chunksFile, 'r');
        if (!$handle) {
            echo("Error opening chunks file: {$this->chunksFile}");
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if ($data && !in_array($data['file'], $existingFiles)) {
                $newChunks[] = $data;
            }
        }
        fclose($handle);

        if (count($newChunks) > 0) {
            $outHandle = fopen($this->embeddingsFile, 'a'); // Append mode.
            if (!$outHandle) {
                echo("Error opening embeddings file: {$this->embeddingsFile}");
            }
            $batch = [];
            foreach ($newChunks as $chunkData) {
                $batch[] = $chunkData;
                if (count($batch) >= $batchSize) {
                    $this->processEmbeddingBatch($batch, $outHandle);
                    $batch = [];
                }
            }
            if (count($batch) > 0) {
                $this->processEmbeddingBatch($batch, $outHandle);
            }
            fclose($outHandle);
            //echo ("Processed embeddings for new chunks.\n");
        } else {
            echo("No new chunks found for embeddings.\n");
        }
    }

    /**
     * Helper method: given a batch of chunk data, compute embeddings and write results.
     */
    private function processEmbeddingBatch($batch, $outHandle)
    {
        // Extract the chunk texts for this batch
        $texts = array_map(function ($data) {
            return $data['chunk'];
        }, $batch);
        $embeddingsBatch = $this->getEmbeddings($texts);
        // Write each embedding along with its chunk metadata
        foreach ($batch as $index => $chunkData) {
            $result = [
                'id' => $chunkData['id'],
                'file' => $chunkData['file'],
                'embedding' => $embeddingsBatch[$index]
            ];
            fwrite($outHandle, json_encode($result) . "\n");
        }
    }

    /**
     * generateTfidfPersistent
     * -------------------------
     * Reads all chunks from the chunks file, computes document frequencies,
     * calculates a global IDF dictionary, and then computes each chunk's TF-IDF vector.
     * The global IDF (along with the list of files in the corpus) is saved to idf.json,
     * and the TF-IDF vectors are saved to tfidf_embeddings.json.
     *
     */
    public function generateTfidfPersistent()
    {
        $df = [];
        $totalDocs = 0;
        $chunks = [];

        $inHandle = fopen($this->chunksFile, 'r');
        if (!$inHandle) {
            echo("Error opening chunks file: {$this->chunksFile}");
        }
        // First pass: build document frequency counts and collect chunks.
        while (($line = fgets($inHandle)) !== false) {
            $chunkData = json_decode($line, true);
            if (!$chunkData) continue;
            $chunks[] = $chunkData;
            $totalDocs++;
            $tokens = $this->tokenize($chunkData['chunk']);
            foreach (array_unique($tokens) as $token) {
                if (!isset($df[$token])) {
                    $df[$token] = 0;
                }
                $df[$token]++;
            }
        }
        fclose($inHandle);

        // Compute IDF values for each token.
        $idf = [];
        foreach ($df as $token => $docCount) {
            $idf[$token] = log($totalDocs / ($docCount + 1)) + 1;
        }

        // Load corpus information (list of processed files) if available.
        $corpus = [];
        if (file_exists('corpus.json')) {
            $corpus = json_decode(file_get_contents('corpus.json'), true);
        }
        $idfData = [
            'files' => $corpus['files'] ?? [],
            'idf' => $idf
        ];
        file_put_contents($this->idfFile, json_encode($idfData));

        // Second pass: compute TF-IDF for each chunk.
        $outHandle = fopen($this->tfidfFile, 'w');
        if (!$outHandle) {
            echo("Error opening TF-IDF file for writing: {$this->tfidfFile}");
        }
        foreach ($chunks as $chunkData) {
            $tf = $this->computeTf($chunkData['chunk']);
            $tfidf = [];
            foreach ($tf as $token => $freq) {
                $tfidf[$token] = $freq * ($idf[$token] ?? 0);
            }
            $result = [
                'id' => $chunkData['id'],
                'file' => $chunkData['file'],
                'tfidf' => $tfidf
            ];
            fwrite($outHandle, json_encode($result) . "\n");
        }
        fclose($outHandle);
        echo "Recomputed TF-IDF for the updated corpus.\n";
    }

    /**
     * getContextPersistent
     * ----------------------
     * Retrieves context based on stored embeddings by reading the embeddings file,
     * computing cosine similarity with the question's embedding, and returning the top K matching chunks.
     *
     * @param string $question The input query.
     * @param int $topK Number of top results to return (default: 2).
     * @return array The top matching chunks.
     */
    public function getContextPersistent($question, $topK = 2)
    {
        $questionEmbedding = $this->getEmbedding($question);
        $similarities = [];

        // Build a map from chunk id to chunk text.
        $chunksMap = [];
        $handle = fopen($this->chunksFile, 'r');
        if (!$handle) {
            echo("Error opening chunks file: {$this->chunksFile}");
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $chunksMap[$data['id']] = $data['chunk'];
        }
        fclose($handle);

        // Read stored embeddings and compute similarity with the question.
        $handle = fopen($this->embeddingsFile, 'r');
        if (!$handle) {
            echo("Error opening embeddings file: {$this->embeddingsFile}");
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $embedding = $data['embedding'];
            $sim = $this->cosineSimilarity($questionEmbedding, $embedding);
            $similarities[$data['id']] = $sim;
        }
        fclose($handle);

        arsort($similarities);
        $topIds = array_slice(array_keys($similarities), 0, $topK, true);
        $results = [];
        foreach ($topIds as $id) {
            $results[] = $chunksMap[$id] ?? "";
        }
        return $results;
    }

    /**
     * getContextTfIdfPersistent
     * ---------------------------
     * Retrieves context using stored TF-IDF vectors by loading the precomputed global IDF from idf.json,
     * computing the TF-IDF vector for the question, and comparing it to each chunk's TF-IDF vector.
     *
     * @param string $question The input query.
     * @param int $topK Number of top results to return (default: 2).
     * @return array The top matching chunks.
     */
    public function getContextTfIdfPersistent($question, $topK = 2)
    {
        // Load the precomputed global IDF dictionary from file.
        $idfHandle = fopen($this->idfFile, 'r');
        if (!$idfHandle) {
            echo("Error opening IDF file: {$this->idfFile}");
        }
        $idfContent = fread($idfHandle, filesize($this->idfFile));
        fclose($idfHandle);
        $idfData = json_decode($idfContent, true);
        if (!$idfData || !isset($idfData['idf'])) {
            echo("Error decoding IDF data from: {$this->idfFile}");
        }
        $idf = $idfData['idf'];

        // Compute TF-IDF vector for the question using the loaded IDF dictionary.
        $questionTf = $this->computeTf($question);
        $questionVector = [];
        foreach ($questionTf as $token => $freq) {
            $questionVector[$token] = $freq * ($idf[$token] ?? 0);
        }

        // Build a map of chunk id to chunk text.
        $chunksMap = [];
        $handle = fopen($this->chunksFile, 'r');
        if (!$handle) {
            echo("Error opening chunks file: {$this->chunksFile}");
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $chunksMap[$data['id']] = $data['chunk'];
        }
        fclose($handle);

        // Compare the question vector to each stored TF-IDF vector.
        $similarities = [];
        $handle = fopen($this->tfidfFile, 'r');
        if (!$handle) {
            echo("Error opening TF-IDF file: {$this->tfidfFile}");
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $tfidfVector = $data['tfidf'];
            $similarities[$data['id']] = $this->cosineSimilarityAssoc($questionVector, $tfidfVector);
        }
        fclose($handle);

        arsort($similarities);
        $topIds = array_slice(array_keys($similarities), 0, $topK, true);
        $results = [];
        foreach ($topIds as $id) {
            $results[] = $chunksMap[$id] ?? "";
        }
        return $results;
    }


    /**
     * getContextCosine
     * ----------------------
     * Retrieves context based on stored embeddings by reading the embeddings file,
     * computing cosine similarity with the question's embedding, and returning the top K matching chunks.
     *
     * Returns an array of arrays with keys: id, chunk, and score.
     *
     * @param string $question The input query.
     * @param int $topK Number of top results to return (default: 2).
     * @return array The top matching chunks with their similarity scores.
     */
    public function getContextCosine($question, $topK = 2)
    {
        $questionEmbedding = $this->getEmbedding($question);
        $similarities = [];

        // Build a map from chunk id to chunk text.
        $chunksMap = [];
        $handle = fopen($this->chunksFile, 'r');
        if (!$handle) {
            echo("Error opening chunks file: {$this->chunksFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $chunksMap[$data['id']] = $data['chunk'];
        }
        fclose($handle);

        // Read stored embeddings and compute similarity with the question.
        $handle = fopen($this->embeddingsFile, 'r');
        if (!$handle) {
            echo("Error opening embeddings file: {$this->embeddingsFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $embedding = $data['embedding'];
            $sim = $this->cosineSimilarity($questionEmbedding, $embedding);
            $similarities[$data['id']] = $sim;
        }
        fclose($handle);

        arsort($similarities);
        $topIds = array_slice(array_keys($similarities), 0, $topK, true);
        $results = [];
        foreach ($topIds as $id) {
            $results[] = [
                'id' => $id,
                'chunk' => $chunksMap[$id] ?? "",
                'score' => $similarities[$id]
            ];
        }
        return $results;
    }

    /**
     * getContextCosineTfIdf
     * ---------------------------
     * Retrieves context using stored TF-IDF vectors by loading the precomputed global IDF from idf.json,
     * computing the TF-IDF vector for the question, and comparing it to each chunk's TF-IDF vector using cosine similarity.
     *
     * Returns an array of arrays with keys: id, chunk, and score.
     *
     * @param string $question The input query.
     * @param int $topK Number of top results to return (default: 2).
     * @return array The top matching chunks with their similarity scores.
     */
    public function getContextCosineTfIdf($question, $topK = 2)
    {
        // Load the precomputed global IDF dictionary from file.
        $idfHandle = fopen($this->idfFile, 'r');
        if (!$idfHandle) {
            echo("Error opening IDF file: {$this->idfFile}");
            return [];
        }
        $idfContent = fread($idfHandle, filesize($this->idfFile));
        fclose($idfHandle);
        $idfData = json_decode($idfContent, true);
        if (!$idfData || !isset($idfData['idf'])) {
            echo("Error decoding IDF data from: {$this->idfFile}");
            return [];
        }
        $idf = $idfData['idf'];

        // Compute TF-IDF vector for the question using the loaded IDF dictionary.
        $questionTf = $this->computeTf($question);
        $questionVector = [];
        foreach ($questionTf as $token => $freq) {
            $questionVector[$token] = $freq * ($idf[$token] ?? 0);
        }

        // Build a map of chunk id to chunk text.
        $chunksMap = [];
        $handle = fopen($this->chunksFile, 'r');
        if (!$handle) {
            echo("Error opening chunks file: {$this->chunksFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $chunksMap[$data['id']] = $data['chunk'];
        }
        fclose($handle);

        // Compare the question vector to each stored TF-IDF vector.
        $similarities = [];
        $handle = fopen($this->tfidfFile, 'r');
        if (!$handle) {
            echo("Error opening TF-IDF file: {$this->tfidfFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $tfidfVector = $data['tfidf'];
            $similarities[$data['id']] = $this->cosineSimilarityAssoc($questionVector, $tfidfVector);
        }
        fclose($handle);

        arsort($similarities);
        $topIds = array_slice(array_keys($similarities), 0, $topK, true);
        $results = [];
        foreach ($topIds as $id) {
            $results[] = [
                'id' => $id,
                'chunk' => $chunksMap[$id] ?? "",
                'score' => $similarities[$id]
            ];
        }
        return $results;
    }

    /**
     * cosineSimilarity
     * ------------------
     * Computes cosine similarity for two numeric vectors.
     *
     * @param array $vec1 The first vector.
     * @param array $vec2 The second vector.
     * @return float The cosine similarity.
     */
    protected function cosineSimilarity($vec1, $vec2)
    {
        $dotProduct = 0;
        $norm1 = 0;
        $norm2 = 0;
        for ($i = 0; $i < count($vec1); $i++) {
            $dotProduct += $vec1[$i] * $vec2[$i];
            $norm1 += $vec1[$i] * $vec1[$i];
            $norm2 += $vec2[$i] * $vec2[$i];
        }
        return ($norm1 && $norm2) ? $dotProduct / (sqrt($norm1) * sqrt($norm2)) : 0;
    }

    /**
     * cosineSimilarityAssoc
     * -----------------------
     * Computes cosine similarity for two associative arrays (used for TF-IDF vectors).
     *
     * @param array $vec1 The first associative vector.
     * @param array $vec2 The second associative vector.
     * @return float The cosine similarity.
     */
    protected function cosineSimilarityAssoc($vec1, $vec2)
    {
        $dotProduct = 0;
        foreach ($vec1 as $token => $val) {
            if (isset($vec2[$token])) {
                $dotProduct += $val * $vec2[$token];
            }
        }
        $norm1 = 0;
        foreach ($vec1 as $val) {
            $norm1 += $val * $val;
        }
        $norm2 = 0;
        foreach ($vec2 as $val) {
            $norm2 += $val * $val;
        }
        return ($norm1 && $norm2) ? $dotProduct / (sqrt($norm1) * sqrt($norm2)) : 0;
    }

    /**
     * tokenize
     * --------
     * Tokenizes text by converting it to lowercase and splitting on non-word characters.
     *
     * @param string $text The input text.
     * @return array An array of tokens.
     */
    protected function tokenize($text)
    {
        $text = strtolower($text);
        return preg_split('/\W+/', $text, -1, PREG_SPLIT_NO_EMPTY);
    }

    /**
     * computeTf
     * ---------
     * Computes term frequency (TF) for a text, normalized by the total token count.
     *
     * @param string $text The input text.
     * @return array Associative array of token frequencies.
     */
    protected function computeTf($text)
    {
        $tokens = $this->tokenize($text);
        $tf = [];
        $total = count($tokens);
        foreach ($tokens as $token) {
            if (!isset($tf[$token])) {
                $tf[$token] = 0;
            }
            $tf[$token]++;
        }
        foreach ($tf as $token => $count) {
            $tf[$token] = $count / $total;
        }
        return $tf;
    }

    /**
     * Computes Euclidean-based similarity for numeric vectors.
     * Similarity = 1/(1 + Euclidean distance).
     *
     * @param array $vec1 First numeric vector.
     * @param array $vec2 Second numeric vector.
     * @return float Similarity score between 0 and 1.
     */
    protected function euclideanSimilarity(array $vec1, array $vec2): float
    {
        $sum = 0;
        $n = count($vec1);
        for ($i = 0; $i < $n; $i++) {
            $sum += pow($vec1[$i] - $vec2[$i], 2);
        }
        $distance = sqrt($sum);
        return 1 / (1 + $distance);
    }

    /**
     * getContextEuclidean
     * ---------------------
     * Retrieves context based on stored embeddings using Euclidean similarity.
     * The similarity is computed as 1/(1+Euclidean distance) between the query embedding
     * and each chunk's embedding.
     *
     * @param string $question The input query.
     * @param int $topK Number of top results to return (default: 2).
     * @return array Array of candidates with keys: id, chunk, score.
     */
    public function getContextEuclidean($question, $topK = 2)
    {
        $questionEmbedding = $this->getEmbedding($question);
        $similarities = [];

        // Build mapping: chunk id => chunk text.
        $chunksMap = [];
        $handle = fopen($this->chunksFile, 'r');
        if (!$handle) {
            echo("Error opening chunks file: {$this->chunksFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $chunksMap[$data['id']] = $data['chunk'];
        }
        fclose($handle);

        // Compute Euclidean similarity using embeddings.
        $handle = fopen($this->embeddingsFile, 'r');
        if (!$handle) {
            echo("Error opening embeddings file: {$this->embeddingsFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $embedding = $data['embedding'];
            $sim = $this->euclideanSimilarity($questionEmbedding, $embedding);
            $similarities[$data['id']] = $sim;
        }
        fclose($handle);

        arsort($similarities);
        $topIds = array_slice(array_keys($similarities), 0, $topK, true);
        $results = [];
        foreach ($topIds as $id) {
            $results[] = [
                'id' => $id,
                'chunk' => $chunksMap[$id] ?? "",
                'score' => $similarities[$id]
            ];
        }
        return $results;
    }

    /**
     * getContextEuclideanTfIdf
     * --------------------------
     * Retrieves context using stored TF-IDF vectors with Euclidean similarity.
     * Computes the query’s TF-IDF vector (using the global IDF from idf.json)
     * and then calculates similarity as 1/(1+Euclidean distance) between vectors.
     *
     * @param string $question The input query.
     * @param int $topK Number of top results to return (default: 2).
     * @return array Array of candidates with keys: id, chunk, score.
     */
    public function getContextEuclideanTfIdf($question, $topK = 2)
    {
        // Load the precomputed global IDF dictionary.
        $idfHandle = fopen($this->idfFile, 'r');
        if (!$idfHandle) {
            echo("Error opening IDF file: {$this->idfFile}");
            return [];
        }
        $idfContent = fread($idfHandle, filesize($this->idfFile));
        fclose($idfHandle);
        $idfData = json_decode($idfContent, true);
        if (!$idfData || !isset($idfData['idf'])) {
            echo("Error decoding IDF data from: {$this->idfFile}");
            return [];
        }
        $idf = $idfData['idf'];

        // Compute the query TF-IDF vector.
        $questionTf = $this->computeTf($question);
        $questionVector = [];
        foreach ($questionTf as $token => $freq) {
            $questionVector[$token] = $freq * ($idf[$token] ?? 0);
        }

        // Build mapping: chunk id => chunk text.
        $chunksMap = [];
        $handle = fopen($this->chunksFile, 'r');
        if (!$handle) {
            echo("Error opening chunks file: {$this->chunksFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $chunksMap[$data['id']] = $data['chunk'];
        }
        fclose($handle);

        // Compute Euclidean similarity for TF-IDF vectors.
        $similarities = [];
        $handle = fopen($this->tfidfFile, 'r');
        if (!$handle) {
            echo("Error opening TF-IDF file: {$this->tfidfFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            $tfidfVector = $data['tfidf'];
            $sim = $this->euclideanSimilarityAssoc($questionVector, $tfidfVector);
            $similarities[$data['id']] = $sim;
        }
        fclose($handle);

        arsort($similarities);
        $topIds = array_slice(array_keys($similarities), 0, $topK, true);
        $results = [];
        foreach ($topIds as $id) {
            $results[] = [
                'id' => $id,
                'chunk' => $chunksMap[$id] ?? "",
                'score' => $similarities[$id]
            ];
        }
        return $results;
    }

    /**
     * Computes Euclidean-based similarity for associative arrays.
     * It considers the union of keys, treating missing values as 0.
     *
     * @param array $vec1 First associative vector.
     * @param array $vec2 Second associative vector.
     * @return float Similarity score between 0 and 1.
     */
    protected function euclideanSimilarityAssoc(array $vec1, array $vec2): float
    {
        $allKeys = array_unique(array_merge(array_keys($vec1), array_keys($vec2)));
        $sum = 0;
        foreach ($allKeys as $key) {
            $a = $vec1[$key] ?? 0;
            $b = $vec2[$key] ?? 0;
            $sum += pow($a - $b, 2);
        }
        $distance = sqrt($sum);
        return 1 / (1 + $distance);
    }

    /**
     * getWeightedContext
     * --------------------
     * Retrieves context by combining four similarity measures:
     *   - Embedding cosine similarity
     *   - Embedding Euclidean similarity
     *   - TF-IDF cosine similarity
     *   - TF-IDF Euclidean similarity
     *
     * Each method's scores are multiplied by a weight and summed.
     *
     * Default weights (modifiable):
     *   - embedding_cosine:    0.3
     *   - embedding_euclidean: 0.2
     *   - tfidf_cosine:        0.3
     *   - tfidf_euclidean:     0.2
     *
     * @param string $question The input query.
     * @param array|null $weights Associative array with keys: 'embedding_cosine', 'embedding_euclidean', 'tfidf_cosine', 'tfidf_euclidean'.
     * @param int $topK Number of top chunks to return (default: 3).
     * @param float $overlap Percentage of previous and following chunk to include in retrieval (default: 0.5).
     * @return array Array of top chunks with combined weighted scores.
     */
    public function getWeightedContext($question, $weights = null, $topK = 3, $overlap = 0.5)
    {
        // Set default weights if not provided.
        if (!$weights) {
            $weights = [
                'embedding_cosine' => 0.3,
                'embedding_euclidean' => 0.2,
                'tfidf_cosine' => 0.3,
                'tfidf_euclidean' => 0.2
            ];
        }

        // Get candidate results from each modular function (requesting more than needed).
        $candidatesEmbeddingCosine = $this->getContextCosine($question, 10);
        $candidatesEmbeddingEuclidean = $this->getContextEuclidean($question, 10);
        $candidatesTfidfCosine = $this->getContextCosineTfIdf($question, 10);
        $candidatesTfidfEuclidean = $this->getContextEuclideanTfIdf($question, 10);

        // Merge candidates by chunk id.
        $merged = [];
        // Helper to merge one candidate list.
        $mergeCandidates = function ($candidates, $scoreKey) use (&$merged) {
            foreach ($candidates as $item) {
                $id = $item['id'];
                if (!isset($merged[$id])) {
                    $merged[$id] = [
                        'id' => $id,
                        'file' => $item['file'],
                        'chunk' => $item['chunk'],
                        'embedding_cosine' => 0,
                        'embedding_euclidean' => 0,
                        'tfidf_cosine' => 0,
                        'tfidf_euclidean' => 0,
                    ];
                }
                $merged[$id][$scoreKey] = $item['score'];
            }
        };

        $mergeCandidates($candidatesEmbeddingCosine, 'embedding_cosine');
        $mergeCandidates($candidatesEmbeddingEuclidean, 'embedding_euclidean');
        $mergeCandidates($candidatesTfidfCosine, 'tfidf_cosine');
        $mergeCandidates($candidatesTfidfEuclidean, 'tfidf_euclidean');

        // Compute a combined weighted score for each candidate.
        foreach ($merged as $id => &$item) {
            $item['combined_score'] =
                $weights['embedding_cosine'] * $item['embedding_cosine'] +
                $weights['embedding_euclidean'] * $item['embedding_euclidean'] +
                $weights['tfidf_cosine'] * $item['tfidf_cosine'] +
                $weights['tfidf_euclidean'] * $item['tfidf_euclidean'];
        }
        unset($item);

        // Sort merged results by combined_score descending.
        $mergedCandidates = array_values($merged);
        usort($mergedCandidates, function ($a, $b) {
            return $b['combined_score'] <=> $a['combined_score'];
        });

        // Load all chunks grouped by file to support overlap.
        $chunksGrouped = [];
        $handle = fopen($this->chunksFile, 'r');
        if ($handle) {
            while (($line = fgets($handle)) !== false) {
                $data = json_decode($line, true);
                if (!$data) continue;
                $file = $data['file'];
                if (!isset($chunksGrouped[$file])) {
                    $chunksGrouped[$file] = [];
                }
                $chunksGrouped[$file][] = $data;
            }
            fclose($handle);
        }
        // Sort each file's chunks by id.
        foreach ($chunksGrouped as $file => &$chunksArr) {
            usort($chunksArr, function ($a, $b) {
                return $a['id'] <=> $b['id'];
            });
        }
        unset($chunksArr);

        // For each top candidate, add overlap from previous and next chunks.
        $finalResults = [];
        $topCandidates = array_slice($mergedCandidates, 0, $topK);
        foreach ($topCandidates as $candidate) {
            $file = $candidate['file'];
            if (!isset($chunksGrouped[$file])) {
                $finalResults[] = $candidate;
                continue;
            }
            $fileChunks = $chunksGrouped[$file];
            // Find candidate's position within its file.
            $position = null;
            foreach ($fileChunks as $idx => $chunkData) {
                if ($chunkData['id'] == $candidate['id']) {
                    $position = $idx;
                    break;
                }
            }
            // Define overlap length as a fraction of candidate chunk length.
            $candidateText = $candidate['chunk'];
            $len = strlen($candidateText);
            $overlapLen = floor($len * $overlap);

            $prevOverlap = "";
            if ($position !== null && $position > 0) {
                $prevChunk = $fileChunks[$position - 1]['chunk'];
                $prevOverlap = substr($prevChunk, -$overlapLen);
            }
            $nextOverlap = "";
            if ($position !== null && $position < count($fileChunks) - 1) {
                $nextChunk = $fileChunks[$position + 1]['chunk'];
                $nextOverlap = substr($nextChunk, 0, $overlapLen);
            }
            // Combine the overlap parts with the candidate chunk.
            $candidate['chunk'] = $prevOverlap . "\n" . $candidateText . "\n" . $nextOverlap;
            $finalResults[] = $candidate;
        }

        return $finalResults;
    }

    /**
     * flushPersistentFiles
     * ---------------------
     * Deletes all persistent data files related to chunking and embeddings.
     * Best called on user request for total data deletion for privacy; debugging; or resetting the entire corpus to troubleshoot.
     *
     * @return void
     */
    public function flushPersistentFiles(): void
    {
        $files = [
            $this->chunksFile,
            $this->embeddingsFile,
            $this->tfidfFile,
            $this->idfFile,
            $this->corpusFile
        ];

        foreach ($files as $file) {
            if (file_exists($file)) {
                if (unlink($file)) {
                    echo "Deleted: {$file}\n";
                } else {
                    echo "Failed to delete: {$file}\n";
                }
            } else {
                echo "Not found (skipped): {$file}\n";
            }
        }
    }
}