<?php

class vendor_option_component
{
    public string $vendor;
    public string $type;
    public bool $needs_key;
    public bool $enabled;
    public stdClass $sub_options;

    public function __construct($vendor)
    {
        $this->vendor = "unknown";
        if ($vendor['vendor'] !== null && $vendor['vendor'] !== "") {
            $this->vendor = $vendor['vendor'];
        }

        $this->type = "unknown";
        if ($vendor['type'] !== null && $vendor['type'] !== "") {
            $this->type = $vendor['type'];
        }

        $this->needs_key = false;
        if ($vendor['needs_key'] !== null) {
            $this->needs_key = $vendor['needs_key'];
        }

        $this->enabled = false;
        if ($vendor['enabled'] !== null) {
            $this->enabled = $vendor['enabled'];
        }

        if ($vendor['sub_options'] !== null && $vendor['sub_options'] !== "") {
            $options = json_decode($vendor['sub_options']);
            $this->sub_options = $options;
            }
        }

    //check if vendor has no sub options
    public function has_no_sub_options(): bool
    {
        if (!(array)$this->sub_options) {
            return true;
        }
        return false;
    }



}