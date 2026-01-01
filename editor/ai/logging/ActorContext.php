<?php
class ActorContext {

    private static $userId = null;
    private static $workspaceId = null;

    public static function set($userId, $workspaceId) {
        if (php_sapi_name() == 'cli'){
            self::$userId = $userId;
            self::$workspaceId = $workspaceId;
        } else {
            return "Unauthorised use.";
        }
    }

    public static function get() {
        if (php_sapi_name() == 'cli'){
            return [
                'user_id' => self::$userId,
                'workspace_id' => self::$workspaceId
            ];
        } else {
         return "Unauthorised use. If in need of further actor details, please make use of the session info.";
        }
    }
}