<?php

class vendor_option_component
{
    public string $vendor;
    public string $type;
    public string $label;
    public bool $needs_key;
    public bool $has_key;
    public bool $enabled;
    public stdClass $sub_options;

    public function __construct($vendor)
    {
        $this->vendor = "unknown";
        if ($vendor['vendor'] !== null && $vendor['vendor'] !== "") {
            $this->vendor = $vendor['vendor'];
        }

        $this->label = "unknown";
        if ($vendor['label'] !== null && $vendor['label'] !== "") {
            $this->label = $vendor['label'];
        }

        $this->type = "unknown";
        if ($vendor['type'] !== null && $vendor['type'] !== "") {
            $this->type = $vendor['type'];
        }

        $this->needs_key = false;
        if ($vendor['needs_key'] !== null) {
            $this->needs_key = $vendor['needs_key'];
        }


        $this->has_api_key();


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

    //check if api key exists for vendor
    private function has_api_key() : void {
        global $xerte_toolkits_site;
        if ($this->needs_key) {
            $key_name = $this->vendor . '_key';
            if ($xerte_toolkits_site->{$key_name} !== null && $xerte_toolkits_site->{$key_name} !== "") {
                //todo check key validity or existance?
                $this->has_key = true;
                return;
            }
        }
        $this->has_key = false;
    }





}