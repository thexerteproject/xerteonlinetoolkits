<?php

class SubTemplate
{
    private $template_name;
    public $description;
    private $template_type_id;
    public $display_name;

    public function __construct($subtemplate_data)
    {
        $this->template_name = $subtemplate_data['template_name'];
        $this->description = $subtemplate_data['description'];
        $this->template_type_id = $subtemplate_data['template_type_id'];
        $this->display_name = $subtemplate_data['display_name'];
    }

    public function ui_element(): string
    {
        return sprintf('
<tr class="template-row">
    <td class="template-image">image placeholder</td>
    <td class="template-name">%s</td>
    <td class="template-description">%s</td>
    <td class="template-action">
        <button type="button" class="create-template-button" 
            onclick="create_template_from_edlib(%d, \'%s\')">
            <i class="fa fa-plus xerte-icon">Create</i>
        </button>
    </td>
</tr>',
            htmlspecialchars($this->display_name, ENT_QUOTES),
            htmlspecialchars($this->description, ENT_QUOTES),
            $this->template_type_id,
            $this->template_name
        );
    }
}
