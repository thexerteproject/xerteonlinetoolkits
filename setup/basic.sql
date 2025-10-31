
CREATE DATABASE IF NOT EXISTS `<databasename>`;

USE `<databasename>`;

DROP TABLE IF EXISTS `$additional_sharing`;
DROP TABLE IF EXISTS `$folderdetails`;
DROP TABLE IF EXISTS `$ldap`;
DROP TABLE IF EXISTS `$logindetails` ;
DROP TABLE IF EXISTS `$originaltemplatesdetails` ;
DROP TABLE IF EXISTS `$play_security_details` ;
DROP TABLE IF EXISTS `$sitedetails` ;
DROP TABLE IF EXISTS `$syndicationcategories` ;
DROP TABLE IF EXISTS `$educationlevel` ;
DROP TABLE IF EXISTS `$grouping` ;
DROP TABLE IF EXISTS `$course`;
DROP TABLE IF EXISTS `$syndicationlicenses` ;
DROP TABLE IF EXISTS `$templatedetails` ;
DROP TABLE IF EXISTS `$templaterights` ;
DROP TABLE IF EXISTS `$templatesyndication` ;
DROP TABLE IF EXISTS `$user_sessions` ;
DROP TABLE IF EXISTS `$user` ;
DROP TABLE IF EXISTS `$user_groups` ;
DROP TABLE IF EXISTS `$user_group_members` ;
DROP TABLE IF EXISTS `$template_group_rights` ;
DROP TABLE IF EXISTS `$folderrights` ;
DROP TABLE IF EXISTS `$folder_group_rights` ;
DROP TABLE IF EXISTS `$oai_publish` ;
DROP TABLE If EXISTS `$management_helper` ;

DROP TABLE IF EXISTS `$lti_context` ;
DROP TABLE IF EXISTS `$lti_keys` ;
DROP TABLE IF EXISTS `$lti_resource` ;
DROP TABLE IF EXISTS `$lti_user` ;
DROP TABLE IF EXISTS `$lti_resource` ;
DROP TABLE IF EXISTS `$lti_user` ;

CREATE TABLE `$additional_sharing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` int(11) DEFAULT NULL,
  `sharing_type` char(255) DEFAULT NULL,
  `extra` char(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;


CREATE TABLE `$folderdetails` (
  `folder_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `login_id` bigint(20) DEFAULT NULL,
  `folder_parent` bigint(20) DEFAULT NULL,
  `folder_name` char(255) DEFAULT NULL,
  `date_created` datetime DEFAULT '2008-12-08',
  PRIMARY KEY (`folder_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$ldap` (
  `ldap_id` bigint(20) NOT NULL auto_increment,
  `ldap_knownname` text NOT NULL,
  `ldap_host` text NOT NULL,
  `ldap_port` text NOT NULL,
  `ldap_username` text,
  `ldap_password` text,
  `ldap_basedn` text,
  `ldap_filter` text,
  `ldap_filter_attr` text,
  PRIMARY KEY  (`ldap_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$logindetails` (
  `login_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` char(255) DEFAULT NULL,
  `lastlogin` datetime DEFAULT NULL,
  `firstname` char(255) DEFAULT NULL,
  `surname` char(255) DEFAULT NULL,
  `disabled` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`login_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$originaltemplatesdetails` (
  `template_type_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `template_framework` char(255) DEFAULT NULL,
  `template_name` char(255) DEFAULT NULL,
  `parent_template` char(255) DEFAULT NULL,
  `description` char(255) DEFAULT NULL,
  `date_uploaded` datetime DEFAULT NULL,
  `display_name` char(255) DEFAULT NULL,
  `display_id` bigint(20) DEFAULT NULL,
  `access_rights` char(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `template_sub_pages` text,
  PRIMARY KEY (`template_type_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

insert  into `$originaltemplatesdetails`(`template_type_id`,`template_framework`,`template_name`,`parent_template`,`description`,`date_uploaded`,`display_name`,`display_id`,`access_rights`,`active`) values (5,'xerte','Nottingham','Nottingham','A flexible template for creating interactive learning objects.','2009-09-02','Xerte Online Toolkit',0,'*',1),(8,'xerte','Rss','Rss','Easily create and maintain an RSS Feed.','2008-04-02','RSS Feed',0,'*',0),(14,'xerte','multipersp','multipersp','A template for creating learning objects to present multiple perspectives on a topic','2009-07-08','Multiple Perspectives',0,'*',0),(15,'xerte','mediaInteractions','mediaInteractions','A  template for presenting a piece of media and creating a series of interactions','2009-09-01','Media Interactions',0,'*',0),(16,'site','site','site','A responsive template for delivering content to all devices.','2009-04-02','Bootstrap Template',0,'*',1),(17,'decision','decision','decision','A template for presenting a series of questions to reach a solution to a problem.','2009-01-01','Decision Tree Template',0,'*',0);;

CREATE TABLE `$play_security_details` (
  `security_id` int(11) NOT NULL AUTO_INCREMENT,
  `security_setting` char(255) DEFAULT NULL,
  `security_data` char(255) DEFAULT NULL,
  `security_info` char(255) DEFAULT NULL,
  PRIMARY KEY (`security_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$sitedetails` (
  `site_id` int(11) NOT NULL AUTO_INCREMENT,
  `site_url` char(255) DEFAULT NULL,
  `apache` char(255) DEFAULT NULL,
  `enable_mime_check` char(255) DEFAULT '',
  `mimetypes` text,
  `enable_file_ext_check` char(255) DEFAULT '',
  `file_extensions` text,
  `enable_clamav_check` char(255) DEFAULT '',
  `clamav_cmd` char(255) DEFAULT '',
  `clamav_opts` char(255) DEFAULT '',
  `site_session_name` char(255) DEFAULT NULL,
  `authentication_method` char(255) DEFAULT '',
  `LDAP_preference` char(255) DEFAULT NULL,
  `LDAP_filter` char(255) DEFAULT NULL,
  `integration_config_path` char(255) DEFAULT NULL,
  `admin_username` char(255) DEFAULT NULL,
  `admin_password` char(255) DEFAULT NULL,
  `site_title` char(255) DEFAULT NULL,
  `site_name` char(255) DEFAULT NULL,
  `site_logo` char(255) DEFAULT NULL,
  `organisational_logo` char(255) DEFAULT NULL,
  `welcome_message` char(255) DEFAULT NULL,
  `site_text` text DEFAULT NULL,
  `news_text` text,
  `pod_one` text,
  `pod_two` text,
  `copyright` char(255) DEFAULT NULL,
  `rss_title` char(255) DEFAULT NULL,
  `synd_publisher` char(255) DEFAULT NULL,
  `synd_rights` char(255) DEFAULT NULL,
  `synd_license` char(255) DEFAULT NULL,
  `demonstration_page` char(255) DEFAULT NULL,
  `form_string` text,
  `peer_form_string` text,
  `module_path` char(255) DEFAULT NULL,
  `website_code_path` char(255) DEFAULT NULL,
  `users_file_area_short` char(255) DEFAULT NULL,
  `users_file_area_path` text,
  `php_library_path` char(255) DEFAULT NULL,
  `import_path` char(255) DEFAULT NULL,
  `root_file_path` char(255) DEFAULT NULL,
  `play_edit_preview_query` text,
  `error_log_path` char(255) DEFAULT NULL,
  `email_error_list` char(255) DEFAULT NULL,
  `error_log_message` char(255) DEFAULT NULL,
  `max_error_size` char(255) DEFAULT NULL,
  `error_email_message` char(255) DEFAULT NULL,
  `ldap_host` char(255) DEFAULT NULL,
  `ldap_port` char(255) DEFAULT NULL,
  `bind_pwd` char(255) DEFAULT NULL,
  `basedn` char(255) DEFAULT NULL,
  `bind_dn` char(255) DEFAULT NULL,
  `flash_save_path` char(255) DEFAULT NULL,
  `flash_upload_path` char(255) DEFAULT NULL,
  `flash_preview_check_path` char(255) DEFAULT NULL,
  `flash_flv_skin` char(255) DEFAULT NULL,
  `site_email_account` char(255) DEFAULT NULL,
  `headers` char(255) DEFAULT NULL,
  `email_to_add_to_username` char(255) DEFAULT NULL,
  `proxy1` char(255) DEFAULT NULL,
  `port1` char(255) DEFAULT NULL,
  `feedback_list` char(255) DEFAULT NULL,
  `LRS_Endpoint` char(255) DEFAULT '',
  `LRS_Key` char(255) DEFAULT '',
  `LRS_Secret` char(255) DEFAULT '',
  `dashboard_enabled` char(255) DEFAULT 'true',
  `dashboard_nonanonymous` char(255) DEFAULT 'true',
  `xapi_force_anonymous_lrs` char(255) DEFAULT 'false',
  `xapi_dashboard_minrole` char(255) DEFAULT 'co-author',
  `dashboard_period` int DEFAULT 14,
  `dashboard_allowed_links` text,
  `course_freetext_enabled` char(255) DEFAULT 'true',
  `tsugi_dir` text,
  `globalhidesocial` char(255) DEFAULT 'false',
  `globalsocialauth` char(255) DEFAULT 'true',
  `default_theme_xerte` char(255) DEFAULT 'xot1',
  `default_theme_site` char(255) DEFAULT 'default',
  `default_theme_decision` char(255) DEFAULT 'default',
  PRIMARY KEY (`site_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$syndicationcategories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` char(255) DEFAULT NULL,
  `parent_id` int(11) DEFAULT 0,
  PRIMARY KEY (`category_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

insert  into `$syndicationcategories`(`category_id`,`category_name`) values (1,'American and Canadian Studies'),(2,'Biology'),(3,'Biomedical Sciences'),(4,'Biosciences'),(5,'Built Environment, The'),(6,'Centre for English Language Education'),(7,'Chemistry'),(9,'Community Health Sciences'),(10,'Computer Science'),(11,'Contemporary Chinese Studies'),(12,'Economics'),(13,'Education'),(14,'English Studies'),(15,'Geography'),(16,'Medicine and Health'),(17,'History'),(18,'Humanities'),(20,'Mathematical Sciences'),(21,'Modern Languages and Cultures'),(22,'Nursing, Midwifery and Physiotherapy'),(23,'Pharmacy'),(24,'Physics & Astronomy'),(25,'Politics and International Relations'),(26,'Psychology'),(27,'Sociology & Social Policy'),(28,'Veterinary Medicine and Science');

CREATE TABLE `$educationlevel` (
                                   `educationlevel_id` int(11) NOT NULL AUTO_INCREMENT,
                                   `educationlevel_name` char(255) DEFAULT NULL,
                                   `parent_id` int(11) DEFAULT 0,
                                   PRIMARY KEY (`educationlevel_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

insert into `$educationlevel` (`educationlevel_id`,`educationlevel_name`) values (1,'University'),(2,'College'),(3,'Secondary Education'),(4,'Primary Educaton'),(5,'Vocational Education'),(6,'Adult Education'),(7,'All');

CREATE TABLE `$grouping` (
  `grouping_id` int(11) NOT NULL AUTO_INCREMENT,
  `grouping_name` char(255) DEFAULT NULL,
  PRIMARY KEY (`grouping_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

insert  into `$grouping` (`grouping_id`,`grouping_name`) values (1,'Grouping 1'),(2,'Grouping 2'),(3,'Grouping 3'),(4,'Grouping 4'),(5,'Grouping 5'),(6,'Grouping 6'),(7,'Grouping 7'),(8,'Grouping 8'),(9,'Grouping 9'),(10,'Grouping 10');

CREATE TABLE `$course` (
  `course_id` int(11) NOT NULL AUTO_INCREMENT,
  `course_name` char(255) DEFAULT NULL,
  PRIMARY KEY (`course_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$syndicationlicenses` (
  `license_id` int(11) NOT NULL AUTO_INCREMENT,
  `license_name` char(255) DEFAULT NULL,
  PRIMARY KEY (`license_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

insert  into `$syndicationlicenses`(`license_id`,`license_name`) values (6,'Creative Commons Attribution-ShareAlike'),(5,'Creative Commons Attribution-NonCommercial-ShareAlike'),(4,'Creative Commons Attribution-NonCommercial'),(3,'Creative Commons Attribution-NonCommercial-NoDerivs'),(2,'Creative Commons Attribution-NoDerivs');

CREATE TABLE `$templatedetails` (
  `template_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `creator_id` bigint(20) DEFAULT NULL,
  `template_type_id` bigint(20) DEFAULT NULL,
  `template_name` char(255) DEFAULT NULL,
  `date_created` datetime DEFAULT NULL,
  `date_modified` datetime DEFAULT NULL,
  `date_accessed` datetime DEFAULT NULL,
  `number_of_uses` bigint(20) DEFAULT NULL,
  `access_to_whom` text,
  `extra_flags` varchar(45) DEFAULT NULL,
  `tsugi_published` int DEFAULT 0,
  `tsugi_usetsugikey` int(1) DEFAULT 1,
  `tsugi_manage_key_id` INT NULL DEFAULT -1,
  `tsugi_privatekeyonly` int(1) DEFAULT 0,
  `tsugi_xapi_enabled` int DEFAULT 0,
  `tsugi_xapi_useglobal` int(1) DEFAULT 1,
  `tsugi_xapi_endpoint` text,
  `tsugi_xapi_key` text,
  `tsugi_xapi_secret` text,
  `tsugi_xapi_student_id_mode` int DEFAULT 0,
  `tsugi_publish_in_store` int DEFAULT 1,
  `tsugi_publish_dashboard_in_store` int DEFAULT 0,
  `dashboard_allowed_links` text,
  `dashboard_display_options` text,
  PRIMARY KEY (`template_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$templaterights` (
  `template_id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `role` char(255) DEFAULT NULL,
  `folder` bigint(20) DEFAULT NULL,
  `notes` text DEFAULT NULL,
   KEY `index1` (`template_id`,`user_id`,`role`(10)),
   KEY `index2` (`folder`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$templatesyndication` (
  `template_id` bigint(20) NOT NULL,
  `description` text DEFAULT NULL,
  `keywords` text DEFAULT NULL,
  `rss` text,
  `export` text,
  `syndication` text,
  `category` char(255) DEFAULT NULL,
  `license` char(255) DEFAULT NULL
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$user_sessions` (
  `session_id` varchar(32) NOT NULL DEFAULT '',
  `access` int(10) unsigned DEFAULT NULL,
  `data` text,
  PRIMARY KEY (`session_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$user` (
  `iduser` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) DEFAULT NULL,
  `password` varchar(100) DEFAULT NULL,
  `firstname` varchar(45) DEFAULT NULL,
  `surname` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`iduser`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$user_groups` (
  `group_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_name` char(255) DEFAULT NULL,
  PRIMARY KEY (`group_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$user_group_members` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` bigint(20) NOT NULL,
  `login_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$template_group_rights` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` bigint(20) NOT NULL,
  `template_id` bigint(20) NOT NULL,
  `role` char(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$folderrights` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `folder_id` int(11) NOT NULL,
  `login_id` int(11) NOT NULL,
  `folder_parent` int(11) NOT NULL,
  `role` char(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `index1` (`folder_id`,`login_id`,`role`(10)),
  KEY `index2` (`folder_parent`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE `$folder_group_rights` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `folder_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `role` char(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `$oai_publish` (
      `audith_id` int(11) NOT NULL AUTO_INCREMENT,
      `template_id` BIGINT(20) NOT NULL,
      `login_id` BIGINT(20) NOT NULL,
      `user_type` VARCHAR(10),
      `status` VARCHAR(10),
      `timestamp` TIMESTAMP,
      PRIMARY KEY (`audith_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `$lti_context` (
  `lti_context_key` varchar(255) NOT NULL,
  `c_internal_id` varchar(255) NOT NULL,
  `updated_on` datetime NOT NULL,
  PRIMARY KEY (`lti_context_key`),
  KEY `c_internal_id` (`c_internal_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `$lti_keys` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `oauth_consumer_key` char(255) NOT NULL,
  `secret` char(255) DEFAULT NULL,
  `name` char(255) DEFAULT NULL,
  `context_id` char(255) DEFAULT NULL,
  `deleted` datetime DEFAULT NULL,
  `updated_on` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `oauth_consumer_key` (`oauth_consumer_key`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `$lti_resource` (
  `lti_resource_key` varchar(255) NOT NULL,
  `internal_id` varchar(255) DEFAULT NULL,
  `internal_type` varchar(255) NOT NULL,
  `updated_on` datetime DEFAULT NULL,
  PRIMARY KEY (`lti_resource_key`),
  KEY `destination2` (`internal_type`),
  KEY `destination` (`internal_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `$lti_user` (
  `lti_user_key` varchar(255) NOT NULL DEFAULT '',
  `lti_user_equ` varchar(255) NOT NULL,
  `updated_on` datetime NOT NULL,
  PRIMARY KEY (`lti_user_key`),
  KEY `lti_user_equ` (`lti_user_equ`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `$role` (	
  `roleid` int NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL UNIQUE,
  PRIMARY KEY (`roleid`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

CREATE TABLE IF NOT EXISTS `$logindetailsrole` (
  `roleid` int NOT NULL,
  `userid` bigint(20) NOT NULL,
  PRIMARY KEY (`roleid`, `userid`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

insert into `$role`(`roleid`, `name`) values
  (1, 'super'),
  (2, 'system'),
  (3, 'templateadmin'),
  (4, 'metaadmin'),
  (5, 'useradmin'),
  (6, 'projectadmin'),
  (7, 'harvestadmin'),
  (8, 'aiuser');

CREATE TABLE IF NOT EXISTS `$management_helper` (
    `interaction_id` int(11) NOT NULL AUTO_INCREMENT,
    `vendor` VARCHAR(10) NOT NULL,
    `label` VARCHAR(34) NOT NULL,
    `type` VARCHAR(10) NOT NULL,
    `needs_key` BOOLEAN NOT NULL,
    `enabled` BOOLEAN NOT NULL ,
    `sub_options` TEXT,
    PRIMARY KEY (`interaction_id`)
) DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;

INSERT INTO `management_helper` VALUES
                                    (1, 'openai', 'GPT (Openai)', 'ai', 1, 0, '{\"generate image\":\"false\",\"image uploads\":\"false\"}'),
                                    (2, 'anthropic', 'Claude (Anthropic)', 'ai', 1, 0, '{\"generate image\":\"false\"}'),
                                    (3, 'mistral', 'Mistral AI', 'ai', 1, 0, '{\"generate image\":\"false\"}'),
                                    (4, 'pexels', 'Pexels', 'image', 1, 0, '{}'),
                                    (5, 'pixabay', 'Pixabay', 'image', 1, 0, '{}'),
                                    (6, 'unsplash', 'Unsplash', 'image', 1, 0, '{}'),
                                    (7, 'wikimedia', 'Wikimedia Foundation', 'image', 0, 0, '{}'),
                                    (8, 'dalle2', 'DallE2 (Generative)', 'image', 1, 0, '{}'),
                                    (9, 'dalle3', 'DallE3 (Generative)', 'image', 1, 0, '{}');

-- todo alek add changes here from the upgrade file.