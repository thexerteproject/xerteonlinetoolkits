<?php

namespace rag;
use DocumentLoaderFactory;

require_once __DIR__.'/../logging/log_ai_request.php';
\_load_language_file("/editor/ai_internal/ai.inc");

abstract class BaseRAG
{
    protected $chunkSize;
    protected $encodingDirectory;
    protected $chunksFile;
    protected $embeddingsFile;
    protected $idfFile;
    protected $tempIdfFile;
    protected $corpusFile;
    protected $tfidfFile;
    protected $tempTfidfFile;

    public function __construct($encodingDirectory, $chunkSize = 2048)
    {
        global $xerte_toolkits_site;
        $this->chunkSize = $chunkSize;
        require_once(str_replace('\\', '/', __DIR__) . "/TextSplitter.php");
        require_once(str_replace('\\', '/', __DIR__) . "/DocumentLoaders.php");

        // Check whether the file does not have path traversal
        x_check_path_traversal($encodingDirectory, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

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
        $this->tempIdfFile = $this->encodingDirectory . 'temp' . DIRECTORY_SEPARATOR . 'idf.json';
        $this->tfidfFile = $this->encodingDirectory . 'tfidf.json';
        $this->tempTfidfFile = $this->encodingDirectory . 'temp' . DIRECTORY_SEPARATOR . 'tfidf.json';
        $this->corpusFile = $this->encodingDirectory . 'corpus.json';

        $this->actor = array('user_id'=>$_SESSION['toolkits_logon_username'],'workspace_id'=>$_SESSION['XAPI_PROXY']);
        //$this->sessionId = $_SESSION['token'];
        $this->sessionId = "token is busted";
    }

    abstract protected function supportsProviderEmbeddings();
    //public function providerActive(): bool { return false; }
    abstract protected function getEmbeddings(array $texts);

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
//    public function processDirectory($directory)
//    {
//        global $xerte_toolkits_site;
//        // Check whether the file does not have path traversal
//        x_check_path_traversal($directory, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');
//
//        // Get all files in the directory (ignoring . and ..)
//        $files = array_filter(scandir($directory), function ($item) use ($directory) {
//            return is_file($directory . '/' . $item);
//        });
//
//        if (!empty($files)) {
//            // Process each file individually.
//            foreach ($files as $file) {
//                $filePath = rtrim($directory, '/') . '/' . $file;
//                $this->processFileChunks($filePath);
//            }
//
//            // Process new embeddings for any new chunks from unprocessed files.
//            $this->processNewEmbeddings();
//
//            // Recompute TF-IDF for the entire corpus.
//            //$this->generateTfidfPersistent();
//
//            //cleans up any unused artifacts and re-computes tf-idf for the cleaned up corpus
//            $this->cleanupStaleArtifacts();
//        }
//    }

    /**
     * processFileList
     * ----------------
     * Processes all files in the given list:
     *   - For each file path, it calls processFileChunks (which checks against corpus.json)
     *   - Then, it processes new embeddings from any new chunks
     *   - Then, it removes any files that used to be in corpus.json but are no longer in the list
     *   - Finally, it cleans up stale artifacts and re-computes TF-IDF vectors for the updated corpus.
     *
     * @param array[] $filePaths Each element is:
     *                ['path' => string, 'metadata' => array]
     * @param bool $corpusGrid A boolean specifying whether the received list represents the state of the entire corpus. Deletes stale artifacts by default.
     * @return array              An array of per-file results or errors.
     */
    public function processFileList(array $filePaths, $corpusGrid = true)
    {
        global $xerte_toolkits_site;
        // Check whether the file does not have path traversal
        foreach ($filePaths as $file) {
            x_check_path_traversal($file['path'], $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');
        }
        $results = [];

        // Build the set of all file‐basenames we consider "in the corpus"
        $currentBasenames = [];
        $currentSourcenames = [];

        foreach ($filePaths as $entry) {
            $path = $entry['path'];
            $meta = $entry['metadata'];
            $source = $entry['metadata']['source'];
            $currentBasenames[] = basename($path);
            $currentSourcenames[] = basename($source);

            // Only attempt to process ones that still exist on disk
            if (!is_file($path)) {
                // File might still exist elsewhere, but since it's not in our list
                // we simply skip re‐processing—it’ll be pruned out of the corpus below.
                continue;
            }

            try {
                $res = $this->processFileChunks($path, $meta, $source);
                $results[] = [
                    'file'   => $path,
                    'source' => $source,
                    'status' => $res,
                ];

                // Compute its hash and then update the stored metadata in corpus.json
                $fileHash = hash_file('sha256', $path);
                if (file_exists($this->corpusFile)) {
                    $corp = json_decode(file_get_contents($this->corpusFile), true) ?: ['hashes'=>[]];
                    if (isset($corp['hashes'][$fileHash])) {
                        // Overwrite with fresh metadata
                        $corp['hashes'][$fileHash]['metaData'] = $meta;
                        file_put_contents(
                            $this->corpusFile,
                            json_encode($corp, JSON_PRETTY_PRINT)
                        );
                    }
                }
            } catch (\Exception $e) {
                $results[] = [
                    'file'  => $path,
                    'source' => $source,
                    'status' => $e->getMessage(),
                ];
            }
        }

        if ($corpusGrid === true && file_exists($this->corpusFile)) {
            $corp = json_decode(file_get_contents($this->corpusFile), true) ?: ['hashes' => []];
            $hashesToPurge = [];

            foreach ($corp['hashes'] as $hash => $data) {
                // Keep only files still in the provided list
                $remaining = array_values(array_intersect($data['files'], $currentSourcenames));

                if (empty($remaining)) {
                    $hashesToPurge[] = $hash;
                    unset($corp['hashes'][$hash]);
                } elseif (count($remaining) !== count($data['files'])) {
                    $corp['hashes'][$hash]['files'] = $remaining;
                }
            }

            file_put_contents($this->corpusFile, json_encode($corp, JSON_PRETTY_PRINT));

            if (!empty($hashesToPurge)) {
                $filterStream = function($path) use ($hashesToPurge) {
                    if (!file_exists($path)) return;
                    $in  = fopen($path, 'r');
                    $out = fopen("{$path}.tmp", 'w');

                    while (($line = fgets($in)) !== false) {
                        $doc = json_decode($line, true);
                        if (!isset($doc['fileHash']) || !in_array($doc['fileHash'], $hashesToPurge, true)) {
                            fwrite($out, json_encode($doc) . "\n");
                        }
                    }

                    fclose($in);
                    fclose($out);
                    rename("{$path}.tmp", $path);
                };

                $filterStream($this->chunksFile);
                $filterStream($this->embeddingsFile);
            }
        }

        // Recompute any new embeddings only if it's supported by the provider
        if ($this->supportsProviderEmbeddings()){
            $this->processNewEmbeddings();
        }
        if ($corpusGrid === true){
            //$corpusGrid being true implies the file list is absolute, meaning all no-longer represented artifacts must be deleted
            $this->cleanupStaleArtifacts();
            $this->generateTfidfPersistent();
        } else {
            //if the file list is not absolute--corpusGrid is false--we must still clean up to purge previous versions and encodings of the same file
            // Re‑build IDF + TF‑IDF
            $this->cleanupStaleArtifacts();
            $this->generateTfidfPersistent();
        }
        return $results;
    }

    /**
     * isHashProcessed
     * ----------------
     * Checks whether this content‑hash was seen before.
     * Records filenames + timestamps for debugging.
     *
     * @param string $fileHash SHA‑256 of the file contents
     * @param string $fileName Name of the file being processed
     * @param bool $autoAdd If true, record new hashes and metadata
     * @return bool             True if we’ve already processed this exact hash
     * @throws \Exception
     */
    protected function isHashProcessed($fileHash, $fileName, $autoAdd = false, $metaData = null)
    {
        if((!isset($_SESSION['toolkits_logon_id'])) && (php_sapi_name() !== 'cli')) {
            die("Session ID not set");
        }

        // 1) Load existing corpus
        $corpus = ['hashes' => []];
        if (file_exists($this->corpusFile)) {
            $raw    = file_get_contents($this->corpusFile);
            $corpus = json_decode($raw, true) ?: $corpus;
        }

        // 2) Purge this fileName from _all_ other_ hashes
        foreach ($corpus['hashes'] as $h => &$entry) {
            if ($h === $fileHash) {
                // don’t touch the entry for the hash we’re about to check
                continue;
            }
            if (false !== ($i = array_search($fileName, $entry['files'], true))) {
                array_splice($entry['files'], $i, 1);
                if (empty($entry['files'])) {
                    unset($corpus['hashes'][$h]);
                }
            }
        }
        unset($entry);

        $now = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))->format('c');

        // 3) Check if this hash already exists
        if (isset($corpus['hashes'][$fileHash])) {
            // 3a) If the fileName is already listed under this hash, it's truly unchanged
            if (in_array($fileName, $corpus['hashes'][$fileHash]['files'], true)) {
                return true;
            }
            // 3b) Else the content matches an existing hash but under a new name
            if ($autoAdd) {
                $corpus['hashes'][$fileHash]['files'][]  = $fileName;
                $corpus['hashes'][$fileHash]['metaData'][] = $metaData;
                $corpus['hashes'][$fileHash]['lastSeen'] = $now;

                file_put_contents($this->corpusFile, json_encode($corpus, JSON_PRETTY_PRINT));
            }
            return false;
        }

        // 4) New hash entirely
        if ($autoAdd) {
            $corpus['hashes'][$fileHash] = [
                'files'     => [$fileName],
                'metaData'  => [$metaData],
                'firstSeen' => $now,
                'lastSeen'  => $now,
            ];
            file_put_contents($this->corpusFile, json_encode($corpus, JSON_PRETTY_PRINT));
        }
        return false;
    }

    // Helper: recursively walk data and replace invalid UTF-8 sequences in strings. Needed for pre-PHP 7.2 version support.
    private function json_utf8_substitute($value)
    {
        if (is_array($value)) {
            foreach ($value as $k => $v) {
                $value[$k] = $this->json_utf8_substitute($v);
            }
        } elseif (is_object($value)) {
            foreach ($value as $k => $v) {
                $value->$k = $this->json_utf8_substitute($v);
            }
        } elseif (is_string($value)) {
            if (function_exists('mb_convert_encoding')) {
                // This effectively replaces invalid UTF-8 sequences with U+FFFD
                $value = mb_convert_encoding($value, 'UTF-8', 'UTF-8');
            } elseif (function_exists('iconv')) {
                // Fallback: drop invalid bytes (≈ JSON_INVALID_UTF8_IGNORE, not SUBSTITUTE)
                // Not 100% equivalent, but avoids json_encode() failures.
                $converted = @iconv('UTF-8', 'UTF-8//IGNORE', $value);
                if ($converted !== false) {
                    $value = $converted;
                }
            }
            // If neither mb_convert_encoding nor iconv exist, we just leave it;
            // json_encode may still fail.
        }

        return $value;
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
     * @throws \Exception
     */
    private function processFileChunks($filePath, $meta, $fileSource)
    {
        global $xerte_toolkits_site;
        $fileName = basename($fileSource);
        $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

        x_check_path_traversal($filePath, $xerte_toolkits_site->users_file_area_full, 'Invalid file path specified');

        // Define supported file types.
        //todo maybe move to other file
        $supported = ['txt', 'text', 'html', 'htm', 'csv', 'xml', 'docx', 'odt', 'pptx' ,'xlsx', 'md', 'markdown', 'pdf'];
        if (!in_array($extension, $supported)) {
            echo "Skipping unsupported file type: {$fileName}\n";
            return "Skipping unsupported file type: {$fileName}\n";
        }

        // 1) Compute file‐hash and timestamp once
        $fileHash = hash_file('sha256', $filePath);
        $now      = (new \DateTimeImmutable('now', new \DateTimeZone('UTC')))
            ->format(\DateTime::ATOM);

        // 2) Skip if already processed
        if ($this->isHashProcessed($fileHash, $fileName)) {
            echo "Skipping {$fileName}: content unchanged since last run.\n";
            return "Skipping {$fileName}: content unchanged since last run.\n";
        }

        // 3) Open chunks file…
        $outHandle = fopen($this->chunksFile, 'a');
        if (!$outHandle) {
            echo("Error opening file for writing chunks: {$this->chunksFile}");
            return "Error opening file for writing chunks: {$this->chunksFile}";
        }

        if ($extension === 'txt' || $extension === 'text') {
            $inHandle  = fopen($filePath, 'r');
            $buffer    = "";
            $chunkIndex = time();
            while (!feof($inHandle)) {
                $buffer .= fread($inHandle, 4096);
                while (strlen($buffer) >= $this->chunkSize) {
                    $chunkText = substr($buffer, 0, $this->chunkSize);
                    $data = [
                        'id'        => $fileName . '-' . $chunkIndex++,
                        'file'      => $fileName,
                        'fileHash'  => $fileHash,
                        'createdAt' => $now,
                        'chunk'     => $chunkText
                    ];
                    fwrite($outHandle, json_encode($data) . "\n");
                    $buffer = substr($buffer, $this->chunkSize);
                }
            }
            if (strlen($buffer) > 0) {
                $data = [
                    'id'        => $fileName . '-' . $chunkIndex++,
                    'file'      => $fileName,
                    'fileHash'  => $fileHash,
                    'createdAt' => $now,
                    'chunk'     => $buffer
                ];
                fwrite($outHandle, json_encode($data) . "\n");
            }
            fclose($inHandle);

        } else {
            // non‐txt loader/splitter branch
            try {
                $loader  = DocumentLoaderFactory::getLoader($filePath);
                $content = $loader->load();
            } catch (\Exception $e) {
                echo "Error loading file {$fileName}: " . $e->getMessage() . "\n";
                fclose($outHandle);
                return "Error loading file {$fileName}: " . $e->getMessage() . "\n";
            }

            $chunksArr  = splitTextByFileType($content, $extension, $this->chunkSize);
            $chunkIndex = time();
            foreach ($chunksArr as $chunkText) {
                $data = array(
                    'id'        => $fileName . '-' . $chunkIndex++,
                    'file'      => $fileName,
                    'fileHash'  => $fileHash,
                    'createdAt' => $now,
                    'chunk'     => $chunkText
                );

                if (defined('JSON_INVALID_UTF8_SUBSTITUTE')) {
                    // PHP >= 7.2: use native behavior
                    $encoded = json_encode($data, JSON_INVALID_UTF8_SUBSTITUTE);
                } else {
                    // PHP 5.6: emulate SUBSTITUTE by cleaning strings first
                    $cleanData = $this->json_utf8_substitute($data);
                    $encoded   = json_encode($cleanData);
                }

                if ($encoded === false) {
                    echo "JSON encode failed: " . json_last_error_msg();
                } else {
                    fwrite($outHandle, $encoded . "\n");
                }
            }
        }

        fclose($outHandle);

        // 4) Finally, record this hash as processed
        $this->isHashProcessed($fileHash, $fileName, true, $meta);
        echo "Processed chunks for {$fileName}.\n";
        return AI_RAG_PROCESSED_CONTENT_FOR. " {$fileName} " . AI_RAG_SUCCESSFULLY . "\n";
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
    private function processNewEmbeddings($batchSize = 10)
    {
        $newChunks      = [];
        $existingHashes = [];

        // 1) Gather all fileHashes we've already embedded
        if (file_exists($this->embeddingsFile)) {
            $handle = fopen($this->embeddingsFile, 'r');
            while (($line = fgets($handle)) !== false) {
                $data = json_decode($line, true);
                if ($data && !in_array($data['fileHash'], $existingHashes, true)) {
                    $existingHashes[] = $data['fileHash'];
                }
            }
            fclose($handle);
        }

        // 2) Load the current set of valid hashes from corpus.json
        $validHashes = [];
        if (file_exists($this->corpusFile)) {
            $corp        = json_decode(file_get_contents($this->corpusFile), true);
            $validHashes = array_keys(
                isset($corp['hashes']) ? $corp['hashes'] : []
            );
        }

        // 3) Scan chunks; pick only those whose fileHash is both valid and not yet embedded
        $handle = fopen($this->chunksFile, 'r');
        if (!$handle) {
            echo("Error opening chunks file: {$this->chunksFile}");
            return;
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (
                $data
                // must come from a “current” file version…
                && in_array($data['fileHash'], $validHashes, true)
                // …and not already in embeddings
                && !in_array($data['fileHash'], $existingHashes, true)
            ) {
                $newChunks[] = $data;
            }
        }
        fclose($handle);

        // 4) batch & call processEmbeddingBatch()
        if (count($newChunks) > 0) {
            $outHandle = fopen($this->embeddingsFile, 'a');
            if (!$outHandle) {
                echo("Error opening embeddings file: {$this->embeddingsFile}");
                return;
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
                    'id'        => $chunkData['id'],
                    'file'      => $chunkData['file'],       // readability only
                    'fileHash'  => $chunkData['fileHash'],   // ← newly added
                    'createdAt' => $chunkData['createdAt'],  // ← newly added (optional)
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
     * The global IDF (along with the list of files in the corpus) is saved to idf.json (or tempIdfFile),
     * and the TF-IDF vectors are saved to tfidf_embeddings.json (or tempTfidfFile).
     *
     * @param array|null $allowedFileHashes Optional array of allowed file hashes to filter by.
     */
    private function generateTfidfPersistent(array $allowedFileHashes = null)
    {
        $df = [];
        $totalDocs = 0;
        $chunks = [];

        $inHandle = fopen($this->chunksFile, 'r');
        if (!$inHandle) {
            echo("Error opening chunks file: {$this->chunksFile}");
            return;
        }
        // First pass: build document frequency counts and collect filtered chunks.

        while (($line = fgets($inHandle)) !== false) {
            $chunkData = json_decode($line, true);
            if (!$chunkData) continue;
            // Apply filtering if $allowedFileHashes is provided
            if ($allowedFileHashes !== null && !in_array($chunkData['fileHash'], $allowedFileHashes)) {
                continue;
            }
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
            'files' => isset($corpus['files']) ? $corpus['files'] : [],
            'idf'   => $idf,
        ];

        // Write to either the normal file or the temp file, depending on filtering
        $idfFileToUse = $allowedFileHashes === null ? $this->idfFile : ($this->tempIdfFile);
        // Create the temp directory, if it's not already there
        $tempDir = dirname($idfFileToUse);
        if (!is_dir($tempDir)) {
            mkdir($tempDir, 0777, true);
        }
        file_put_contents($idfFileToUse, json_encode($idfData));

        // Second pass: compute TF-IDF for each filtered chunk.
        $tfidfFileToUse = $allowedFileHashes === null ? $this->tfidfFile : ($this->tempTfidfFile);
        $outHandle = fopen($tfidfFileToUse, 'w');
        if (!$outHandle) {
            echo("Error opening TF-IDF file for writing: {$tfidfFileToUse}");
            return;
        }
        foreach ($chunks as $chunkData) {
            $tf = $this->computeTf($chunkData['chunk']);
            $tfidf = [];
            foreach ($tf as $token => $freq) {
                $tfidf[$token] = $freq * (isset($idf[$token]) ? $idf[$token] : 0);
            }
            $result = [
                'id' => $chunkData['id'],
                'file' => $chunkData['file'],
                'tfidf' => $tfidf
            ];
            fwrite($outHandle, json_encode($result) . "\n");
        }
        fclose($outHandle);

        if ($allowedFileHashes === null) {
            echo "Recomputed TF-IDF for the full corpus.\n";
        } else {
            echo "Computed TF-IDF for the filtered corpus. See: {$idfFileToUse}, {$tfidfFileToUse}\n";
        }
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
//    public function getContextPersistent($question, $topK = 2)
//    {
//        $questionEmbedding = $this->getEmbedding($question);
//        $similarities = [];
//
//        // Build a map from chunk id to chunk text.
//        $chunksMap = [];
//        $handle = fopen($this->chunksFile, 'r');
//        if (!$handle) {
//            echo("Error opening chunks file: {$this->chunksFile}");
//        }
//        while (($line = fgets($handle)) !== false) {
//            $data = json_decode($line, true);
//            if (!$data) continue;
//            $chunksMap[$data['id']] = $data['chunk'];
//        }
//        fclose($handle);
//
//        // Read stored embeddings and compute similarity with the question.
//        $handle = fopen($this->embeddingsFile, 'r');
//        if (!$handle) {
//            echo("Error opening embeddings file: {$this->embeddingsFile}");
//        }
//        while (($line = fgets($handle)) !== false) {
//            $data = json_decode($line, true);
//            if (!$data) continue;
//            $embedding = $data['embedding'];
//            $sim = $this->cosineSimilarity($questionEmbedding, $embedding);
//            $similarities[$data['id']] = $sim;
//        }
//        fclose($handle);
//
//        arsort($similarities);
//        $topIds = array_slice(array_keys($similarities), 0, $topK, true);
//        $results = [];
//        foreach ($topIds as $id) {
//            $results[] = $chunksMap[$id] ?? "";
//        }
//        return $results;
//    }

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
//    public function getContextTfIdfPersistent($question, $topK = 2)
//    {
//        // Load the precomputed global IDF dictionary from file.
//        $idfHandle = fopen($this->idfFile, 'r');
//        if (!$idfHandle) {
//            echo("Error opening IDF file: {$this->idfFile}");
//        }
//        $idfContent = fread($idfHandle, filesize($this->idfFile));
//        fclose($idfHandle);
//        $idfData = json_decode($idfContent, true);
//        if (!$idfData || !isset($idfData['idf'])) {
//            echo("Error decoding IDF data from: {$this->idfFile}");
//        }
//        $idf = $idfData['idf'];
//
//        // Compute TF-IDF vector for the question using the loaded IDF dictionary.
//        $questionTf = $this->computeTf($question);
//        $questionVector = [];
//        foreach ($questionTf as $token => $freq) {
//            $questionVector[$token] = $freq * ($idf[$token] ?? 0);
//        }
//
//        // Build a map of chunk id to chunk text.
//        $chunksMap = [];
//        $handle = fopen($this->chunksFile, 'r');
//        if (!$handle) {
//            echo("Error opening chunks file: {$this->chunksFile}");
//        }
//        while (($line = fgets($handle)) !== false) {
//            $data = json_decode($line, true);
//            if (!$data) continue;
//            $chunksMap[$data['id']] = $data['chunk'];
//        }
//        fclose($handle);
//
//        // Compare the question vector to each stored TF-IDF vector.
//        $similarities = [];
//        $handle = fopen($this->tfidfFile, 'r');
//        if (!$handle) {
//            echo("Error opening TF-IDF file: {$this->tfidfFile}");
//        }
//        while (($line = fgets($handle)) !== false) {
//            $data = json_decode($line, true);
//            if (!$data) continue;
//            $tfidfVector = $data['tfidf'];
//            $similarities[$data['id']] = $this->cosineSimilarityAssoc($questionVector, $tfidfVector);
//        }
//        fclose($handle);
//
//        arsort($similarities);
//        $topIds = array_slice(array_keys($similarities), 0, $topK, true);
//        $results = [];
//        foreach ($topIds as $id) {
//            $results[] = $chunksMap[$id] ?? "";
//        }
//        return $results;
//    }

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
     * @param array|null $allowedFileHashes Optional array of allowed file hashes to filter by.
     * @return array The top matching chunks with their similarity scores.
     */
    private function getContextCosine($question, $topK = 2, array $allowedFileHashes = null)
    {
        $questionEmbedding = $this->getEmbedding($question);
        $similarities = [];

        // Build a map from chunk id to chunk text, **filtered by fileHash** if provided.
        $chunksMap = [];
        $handle = fopen($this->chunksFile, 'r');
        if (!$handle) {
            echo("Error opening chunks file: {$this->chunksFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            if ($allowedFileHashes !== null && !in_array($data['fileHash'], $allowedFileHashes)) {
                continue;
            }
            $chunksMap[$data['id']] = [
                'file'  => $data['fileHash'],
                'chunk' => $data['chunk'],
            ];
        }
        fclose($handle);

        // Read stored embeddings and compute similarity with the question, **filtered by fileHash** if provided.
        $handle = fopen($this->embeddingsFile, 'r');
        if (!$handle) {
            echo("Error opening embeddings file: {$this->embeddingsFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            if ($allowedFileHashes !== null && !in_array($data['fileHash'], $allowedFileHashes)) {
                continue;
            }
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
                'id'    => $id,
                'chunk' => isset($chunksMap[$id]['chunk']) ? $chunksMap[$id]['chunk'] : "",
                'file'  => isset($chunksMap[$id]['file'])  ? $chunksMap[$id]['file']  : "",
                'score' => $similarities[$id],
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
     * @param array|null $allowedFileHashes Optional array of allowed file hashes to filter by, when it is not null the temporary idf and tfidf encodings are used.
     * @return array The top matching chunks with their similarity scores.
     */
    private function getContextCosineTfIdf($question, $topK = 2, $allowedFileHashes)
    {
        // Write to either the normal file or the temp file, depending on filtering
        $idfFileToUse = $allowedFileHashes === null ? $this->idfFile : ($this->tempIdfFile);
        $tfidfFileToUse = $allowedFileHashes === null ? $this->tfidfFile : ($this->tempTfidfFile);

        // Load the precomputed global IDF dictionary from file.
        $idfHandle = fopen($idfFileToUse, 'r');
        if (!$idfHandle) {
            echo("Error opening IDF file: {$idfFileToUse}");
            return [];
        }
        $idfContent = fread($idfHandle, filesize($idfFileToUse));
        fclose($idfHandle);
        $idfData = json_decode($idfContent, true);
        if (!$idfData || !isset($idfData['idf'])) {
            echo("Error decoding IDF data from: {$idfFileToUse}");
            return [];
        }
        $idf = $idfData['idf'];

        // Compute TF-IDF vector for the question using the loaded IDF dictionary.
        $questionTf = $this->computeTf($question);
        $questionVector = [];
        foreach ($questionTf as $token => $freq) {
            $questionVector[$token] = $freq * (isset($idf[$token]) ? $idf[$token] : 0);
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
            $chunksMap[$data['id']] = [
                'file'  => $data['fileHash'],
                'chunk' => $data['chunk'],
            ];
        }
        fclose($handle);

        // Compare the question vector to each stored TF-IDF vector.
        $similarities = [];
        $handle = fopen($tfidfFileToUse, 'r');
        if (!$handle) {
            echo("Error opening TF-IDF file: {$tfidfFileToUse}");
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
                'id'    => $id,
                'chunk' => isset($chunksMap[$id]['chunk']) ? $chunksMap[$id]['chunk'] : "",
                'file'  => isset($chunksMap[$id]['file'])  ? $chunksMap[$id]['file']  : "",
                'score' => $similarities[$id],
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
    protected function euclideanSimilarity(array $vec1, array $vec2)
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
     * @param array|null $allowedFileHashes Optional array of allowed file hashes to filter by.
     * @return array Array of candidates with keys: id, chunk, score.
     */
    private function getContextEuclidean($question, $topK = 2, $allowedFileHashes = null)
    {
        $questionEmbedding = $this->getEmbedding($question);
        $similarities = [];

        // Build mapping: chunk id => chunk text, filter by fileHash if provided.
        $chunksMap = [];
        $handle = fopen($this->chunksFile, 'r');
        if (!$handle) {
            echo("Error opening chunks file: {$this->chunksFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            if ($allowedFileHashes !== null && !in_array($data['fileHash'], $allowedFileHashes)) {
                continue;
            }

            $chunksMap[$data['id']] = [
                'file'  => $data['fileHash'],
                'chunk' => $data['chunk'],
            ];
        }
        fclose($handle);

        // Compute Euclidean similarity using embeddings, filter by fileHash if provided.
        $handle = fopen($this->embeddingsFile, 'r');
        if (!$handle) {
            echo("Error opening embeddings file: {$this->embeddingsFile}");
            return [];
        }
        while (($line = fgets($handle)) !== false) {
            $data = json_decode($line, true);
            if (!$data) continue;
            if ($allowedFileHashes !== null && !in_array($data['fileHash'], $allowedFileHashes)) {
                continue;
            }
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
                'id'    => $id,
                'chunk' => isset($chunksMap[$id]['chunk']) ? $chunksMap[$id]['chunk'] : "",
                'file'  => isset($chunksMap[$id]['file'])  ? $chunksMap[$id]['file']  : "",
                'score' => $similarities[$id],
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
     * @param array|null $allowedFileHashes Optional array of allowed file hashes to filter by, when it is not null the temporary idf and tfidf encodings are used.
     * @return array Array of candidates with keys: id, chunk, score.
     */
    private function getContextEuclideanTfIdf($question, $topK = 2, $allowedFileHashes)
    {
        // Write to either the normal file or the temp file, depending on filtering
        $idfFileToUse = $allowedFileHashes === null ? $this->idfFile : ($this->tempIdfFile);
        $tfidfFileToUse = $allowedFileHashes === null ? $this->tfidfFile : ($this->tempTfidfFile);

        // Load the precomputed global IDF dictionary.
        $idfHandle = fopen($idfFileToUse, 'r');
        if (!$idfHandle) {
            echo("Error opening IDF file: {$idfFileToUse}");
            return [];
        }
        $idfContent = fread($idfHandle, filesize($idfFileToUse));
        fclose($idfHandle);
        $idfData = json_decode($idfContent, true);
        if (!$idfData || !isset($idfData['idf'])) {
            echo("Error decoding IDF data from: {$idfFileToUse}");
            return [];
        }
        $idf = $idfData['idf'];

        // Compute the query TF-IDF vector.
        $questionTf = $this->computeTf($question);
        $questionVector = [];
        foreach ($questionTf as $token => $freq) {
            $questionVector[$token] = $freq * (isset($idf[$token]) ? $idf[$token] : 0);
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
            $chunksMap[$data['id']] = [
                'file'  => $data['fileHash'],
                'chunk' => $data['chunk'],
            ];
        }
        fclose($handle);

        // Compute Euclidean similarity for TF-IDF vectors.
        $similarities = [];
        $handle = fopen($tfidfFileToUse, 'r');
        if (!$handle) {
            echo("Error opening TF-IDF file: {$tfidfFileToUse}");
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
                'id'    => $id,
                'chunk' => isset($chunksMap[$id]['chunk']) ? $chunksMap[$id]['chunk'] : "",
                'file'  => isset($chunksMap[$id]['file'])  ? $chunksMap[$id]['file']  : "",
                'score' => $similarities[$id],
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
    protected function euclideanSimilarityAssoc(array $vec1, array $vec2)
    {
        $allKeys = array_unique(array_merge(array_keys($vec1), array_keys($vec2)));
        $sum = 0;
        foreach ($allKeys as $key) {
            $a = isset($vec1[$key]) ? $vec1[$key] : 0;
            $b = isset($vec2[$key]) ? $vec2[$key] : 0;
            $sum += pow($a - $b, 2);
        }
        $distance = sqrt($sum);
        return 1 / (1 + $distance);
    }
    /**
     * matchSourceToHashes
     * --------------------
     * Given a list of partial file sources, as stored in the dataGrid, normalizes the paths and finds the matching hash.
     *
     * @param array $fileList a list of full or partial file source paths.
     */
    private function matchSourceToHashes(array $fileList) {
        function normalize_path($path)
        {
            // 1) turn backslashes into forward-slashes
            $p = str_replace('\\', '/', $path);

            // 2) collapse multiple slashes into one
            return preg_replace('#/+#', '/', $p);
        }

        $corpusData = json_decode(file_get_contents($this->corpusFile), true);

        $allowedFileHashes = [];

        foreach ($fileList as $file) {
            $path = normalize_path(urldecode(ltrim($file))); //first normalize whatever is in col 2, just in case a valid path has already been substituted if it's a transcript
            //If it's already a full path, don't do anything extra. If it isn't, add the base directory
            if(!(realpath($path))){
                $path = normalize_path(urldecode(rtrim($this->encodingDirectory, '/\\') . '/' . ltrim($file, '/\\')));
            }
            $file = $path;
            $matched = false;
            foreach ($corpusData['hashes'] as $hash => $entry) {
                $entrySource = isset($entry['metaData']['source'])
                    ? $entry['metaData']['source']
                    : '';
                if (basename($entrySource) === basename($file)) {
                    $allowedFileHashes[] = $hash; // just add the hash to the output array
                    $matched = true;
                    break; // Only want the first match
                }
            }
            if (!$matched) {
                $allowedFileHashes[] = null;
            }
        }
        return $allowedFileHashes;
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
     * Default weights with no embedding service active (modifiable):
     *  - tfidf_cosine:         0.6
     *  - tfidf_euclidean:      0.4
     *
     * @param string $question The input query.
     * @param null $allowedFiles An array of hashes to define a limited scope from the whole corpus.
     * @param array|null $weights Associative array with keys: 'embedding_cosine', 'embedding_euclidean', 'tfidf_cosine', 'tfidf_euclidean'.
     * @param int $topK Number of top chunks to return (default: 3).
     * @param float $overlap Percentage of previous and following chunk to include in retrieval (default: 0.5).
     * @return array Array of top chunks with combined weighted scores.
     */
    public function getWeightedContext($question, $allowedFiles = null, $weights = null, $topK = 3, $overlap = 0.5)
    {
        $useProvider = $this->supportsProviderEmbeddings();
        // Set default weights if not provided.
        if (!$weights) {
            if ($useProvider) {
                $weights = [
                    'embedding_cosine' => 0.3,
                    'embedding_euclidean' => 0.2,
                    'tfidf_cosine' => 0.3,
                    'tfidf_euclidean' => 0.2
                ];
            } else {
                $weights = [
                    'tfidf_cosine' => 0.6,
                    'tfidf_euclidean' => 0.4
                ];
            }
        }
        //Retrieve the hashes for all the indicated allowed files
        $allowedFileHashes = $allowedFiles !== null ? $this->matchSourceToHashes($allowedFiles) : null;

        // Get candidate results from each modular function (requesting more than strictly needed for more comprehensive results at expense of some computation; the topK can be lowered down to 3 typically at risk of returning less relevant results).
        if ($useProvider){
            $candidatesEmbeddingCosine = $this->getContextCosine($question, 10, $allowedFileHashes);
            $candidatesEmbeddingEuclidean = $this->getContextEuclidean($question, 10, $allowedFileHashes);
        }

        /*
         * If allowedFileHashes is not null, it means the user has requested a restricted context
         * We take the provided list, which is of the partial file sources, and retrieve the associated hashes from the
         * corpus file for filtering.
         */

        if ($allowedFileHashes != null){
            $this->generateTfidfPersistent($allowedFileHashes);
        }
        $candidatesTfidfCosine = $this->getContextCosineTfIdf($question, 10, $allowedFileHashes);
        $candidatesTfidfEuclidean = $this->getContextEuclideanTfIdf($question, 10, $allowedFileHashes);

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
        if ($useProvider){
            $mergeCandidates($candidatesEmbeddingCosine, 'embedding_cosine');
            $mergeCandidates($candidatesEmbeddingEuclidean, 'embedding_euclidean');
        }
        $mergeCandidates($candidatesTfidfCosine, 'tfidf_cosine');
        $mergeCandidates($candidatesTfidfEuclidean, 'tfidf_euclidean');

        // Compute a combined weighted score for each candidate.
        if ($useProvider) {
            foreach ($merged as $id => &$item) {
                $item['combined_score'] =
                    $weights['embedding_cosine'] * $item['embedding_cosine'] +
                    $weights['embedding_euclidean'] * $item['embedding_euclidean'] +
                    $weights['tfidf_cosine'] * $item['tfidf_cosine'] +
                    $weights['tfidf_euclidean'] * $item['tfidf_euclidean'];
            }
            unset($item);
        } else {
            foreach ($merged as $id => &$item) {
                $item['combined_score'] =
                    $weights['tfidf_cosine'] * $item['tfidf_cosine'] +
                    $weights['tfidf_euclidean'] * $item['tfidf_euclidean'];
            }
            unset($item);
        }

        // Sort merged results by combined_score descending.
        $mergedCandidates = array_values($merged);
        usort($mergedCandidates, function ($a, $b) {
            if ($b['combined_score'] == $a['combined_score']) {
                return 0;
            }
            return ($b['combined_score'] < $a['combined_score']) ? -1 : 1;
        });

        // Load all chunks grouped by file to support overlap.
        $chunksGrouped = [];
        $handle = fopen($this->chunksFile, 'r');
        if ($handle) {
            while (($line = fgets($handle)) !== false) {
                $data = json_decode($line, true);
                if (!$data) continue;
                $file = $data['fileHash'];
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
                if ($a['id'] == $b['id']) {
                    return 0;
                }
                return ($a['id'] < $b['id']) ? -1 : 1;

            });
        }
        unset($chunksArr);

        // For each top candidate, add overlap from previous and next chunks.
        $finalResults = [];
        $topCandidates = array_slice($mergedCandidates, 0, $topK);
        foreach ($topCandidates as $candidate) {
            //$candidate['file'] refers to the hash of the file, not the file path
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
//    public function flushPersistentFiles(): void
//    {
//        $files = [
//            $this->chunksFile,
//            $this->embeddingsFile,
//            $this->tfidfFile,
//            $this->idfFile,
//            $this->corpusFile
//        ];
//
//        foreach ($files as $file) {
//            if (file_exists($file)) {
//                if (unlink($file)) {
//                    echo "Deleted: {$file}\n";
//                } else {
//                    echo "Failed to delete: {$file}\n";
//                }
//            } else {
//                echo "Not found (skipped): {$file}\n";
//            }
//        }
//    }

    /**
     * Remove all data for one file (by path) and re‑compute IDF/TF‑IDF.
     */
    //todo alek remove this? look at next cleaning function
//    public function removeFileArtifacts(string $filePath): void
//    {
//        $fileName = basename($filePath);
//        $fileHash = hash_file('sha256', $filePath);
//
//        // 1) === Corpus cleanup ===
//        if (file_exists($this->corpusFile)) {
//            $corp = json_decode(file_get_contents($this->corpusFile), true) ?: ['hashes'=>[]];
//
//            // Drop this fileName from any hash entry; if empty, drop the hash
//            foreach ($corp['hashes'] as $h => &$entry) {
//                if (false !== ($i = array_search($fileName, $entry['files'], true))) {
//                    array_splice($entry['files'], $i, 1);
//                    if (empty($entry['files'])) {
//                        unset($corp['hashes'][$h]);
//                    }
//                }
//            }
//            unset($entry);
//
//            file_put_contents(
//                $this->corpusFile,
//                json_encode($corp, JSON_PRETTY_PRINT)
//            );
//            echo "Removed {$fileName} from corpus.json\n";
//        }
//
//        // 2) === Chunk & Embedding cleanup ===
//        // helper to rewrite a JSONL file sans any entries with this fileHash
//        $filter = function(string $path) use ($fileHash) {
//            $tmp = "{$path}.tmp";
//            if (!file_exists($path)) return;
//            $in  = fopen($path, 'r');
//            $out = fopen($tmp, 'w');
//            while (($line = fgets($in)) !== false) {
//                $data = json_decode($line, true);
//                if (!$data || ($data['fileHash'] ?? null) === $fileHash) {
//                    // skip any chunk/embedding for this file version
//                    continue;
//                }
//                fwrite($out, json_encode($data) . "\n");
//            }
//            fclose($in);
//            fclose($out);
//            rename($tmp, $path);
//            echo "Cleaned up {$path}\n";
//        };
//
//        $filter($this->chunksFile);
//        $filter($this->embeddingsFile);
//
//        // 3) === Re‑compute IDF + TF‑IDF on whatever’s left ===
//        $this->generateTfidfPersistent();
//        echo "Re‑generated IDF and TF‑IDF on remaining corpus.\n";
//    }

    /**
     * Remove all chunk & embedding entries whose fileHash
     * is no longer in the global corpus, then rebuild IDF/TF‑IDF.
     */
    private function cleanupStaleArtifacts()
    {
        // 1) Load valid hashes from the corpus
        if (!file_exists($this->corpusFile)) {
            echo "No corpus file found—skipping cleanup.\n";
            return;
        }
        $corp        = json_decode(file_get_contents($this->corpusFile), true);
        $validHashes = array_keys(isset($corp['hashes']) ? $corp['hashes'] : []);
        if (empty($validHashes)) {
            echo "Corpus is empty—nothing to keep.\n";
            return;
        }

        // 2) Helper to rewrite JSONL, keeping only valid fileHashes
        $filterJsonl = function($path) use ($validHashes) {
            if (!file_exists($path)) {
                echo "File not found (skipping): {$path}\n";
                return;
            }
            $tmp    = "{$path}.tmp";
            $in     = fopen($path, 'r');
            $out    = fopen($tmp, 'w');
            $kept   = 0;
            while (($line = fgets($in)) !== false) {
                $data = json_decode($line, true);
                // if it has a fileHash field, keep only those in validHashes
                if (isset($data['fileHash']) && in_array($data['fileHash'], $validHashes, true)) {
                    fwrite($out, json_encode($data) . "\n");
                    $kept++;
                }
            }
            fclose($in);
            fclose($out);
            rename($tmp, $path);
            echo "Retained {$kept} entries in {$path}\n";
        };

        // 3) Apply to chunks and embeddings
        $filterJsonl($this->chunksFile);
        $filterJsonl($this->embeddingsFile);
    }
    /**
     * Return the path of the list of processed corpus files.
     */
    public function getCorpusDirectory (){
        return $this->corpusFile;
    }

    public function isCorpusValid() {
        if (!file_exists($this->corpusFile)) {
            return false;
        }
        $contents = file_get_contents($this->corpusFile);
        $json = json_decode($contents, true);

        // Check for empty file, invalid JSON, or hashes array is empty
        if (
            empty($json) ||
            !isset($json['hashes']) ||
            !is_array($json['hashes']) ||
            count($json['hashes']) === 0
        ) {
            return false;
        }

        return true;
    }
}