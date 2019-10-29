<?php
/**
 * Created by PhpStorm.
 * User: Akshay
 * Date: 10/24/2018
 * Time: 4:01 PM
 */

    define("TEMPLATE_UPLOAD_INCORRECT_FILE_TYPE", "The file you are trying to upload is not a .zip file. Please try again!");

    define("TEMPLATE_UPLOAD_CORRECT", "The file has been extracted successfully!");

    define("TEMPLATE_UPLOAD_ERROR", "The file hasn't been uploaded successfully!, please try again/");

    define("TEMPLATE_UPLOAD_HAS_NO_TEMPLATE_XML", "The .zip file doesn't contain a template.xml!");

    define("TEMPLATE_UPLOAD_HAS_NO_MEDIA", "The .zip file doesn't contain a media folder!");

    define("TEMPLATE_UPLOAD_EMPTY_DESCRIPTION", "Description can't be empty!");

    define("TEMPLATE_UPLOAD_CANT_DETERMINE_PARENT_TEMPLATE", "Cannot determine the parent template. The template.xml in the zip file is not valid.");

    define("TEMPLATE_UPLOAD_INVALID_PARENT_TEMPLATE", "Parent template '{0}' is not recognised as a valid parent template in this installation.");

    define("TEMPLATE_UPLOAD_FILE_CANT_BE_UPLOADED", "Something went wrong with moving the current zip file! Please try again!");

    define("TEMPLATE_UPLOAD_FILE_UPLOAD_SUCCESS", "The learning object has been imported successfully as a sub-template!");

    define("TEMPLATE_UPLOAD_CANT_UPLOAD_PARENT", "Parent templates cannot be overwritten, choose a different sub-template name!");

    define("TEMPLATE_UPLOAD_NO_FILE_SELECTED", "There is no file selected!");
?>