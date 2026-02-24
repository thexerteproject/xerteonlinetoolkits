<?PHP     

	/**
	 *
	 * internal ai english language file, for messages upon completion/failure of an AI or AI-Adjacent request.
     *
	 */

    //AI: Internal Error Messages & Other User Communications
    define("AI_INTERNAL_BASEREQUEST_ERROR_API", "There was an error with the API response. If this persists, please inform your administrator.");
    define("AI_INTERNAL_BASEREQUEST_ERROR_NETWORK", "There was an unexpected network error. Please wait a few minutes, then try again. If this persists, please inform your administrator.");
    define("AI_INTERNAL_BASEREQUEST_ERROR_JSONPARSE", "There was an unexpected error while processing your request. If this persists, please inform your administrator.");
    define("AI_INTERNAL_BASEREQUEST_ERROR_DEFAULT", "An unexpected error occurred. If this persists, please inform your administrator.");
    define("AI_INTERNAL_ALLREQUESTS_REQUESTED_API_NOT_FOUND", "The requested vendor was not found as an option.");

    //Specifically for RAG, Context and other messages of the same type
    define("AI_RAG_PROCESSED_CONTENT_FOR", "Processed content for");
    define("AI_RAG_SUCCESSFULLY", "successfully.");

    define("AI_SYNC_LEARNING_OBJECT", "Learning Object");
    define("AI_SYNC_LEARNING_OBJECT_DESCRIPTOR", "The latest synced version of the learning object preview.");
    define("AI_SYNC_FILE_PROCESS_ERROR", "An error occured while processing your file:");

    define("AI_SYNC_PATCH_STAGE_TRANSCRIPTION", "Transcription");
    define("AI_SYNC_PATCH_MESSAGE_TRANSCRIPTION", "Transcribing file...");
    define("AI_SYNC_PATCH_STAGE_ENCODING", "Encoding");
    define("AI_SYNC_PATCH_MESSAGE_ENCODING", "Encoding file...");

    define("AI_SYNC_PATCH_STAGE_FINALIZING", "Finalizing");
    define("AI_SYNC_PATCH_MESSAGE_FINALIZING", "Processing finished. File is ready to use!");

    define("AI_SYNC_PATCH_STAGE_ERROR", "Error");
    define("AI_SYNC_PATCH_MESSAGE_ERROR", "We encountered an error. Please try again later. If this problem persists, please contact an administrator.");



