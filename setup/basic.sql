
DROP TABLE IF EXISTS `$additional_sharing`;
DROP TABLE IF EXISTS `$folderdetails`;
DROP TABLE IF EXISTS `$ldap`;
DROP TABLE IF EXISTS `$logindetails` ;
DROP TABLE IF EXISTS `$originaltemplatesdetails` ;
DROP TABLE IF EXISTS `$play_security_details` ;
DROP TABLE IF EXISTS `$sitedetails` ;
DROP TABLE IF EXISTS `$syndicationcategories` ;
DROP TABLE IF EXISTS `$syndicationlicenses` ;
DROP TABLE IF EXISTS `$templatedetails` ;
DROP TABLE IF EXISTS `$templaterights` ;
DROP TABLE IF EXISTS `$templatesyndication` ;
DROP TABLE IF EXISTS `$user_sessions` ;

DROP TABLE IF EXISTS `$lti_context` ;
DROP TABLE IF EXISTS `$lti_keys` ;
DROP TABLE IF EXISTS `$lti_resource` ;
DROP TABLE IF EXISTS `$lti_user` ;


CREATE TABLE `$additional_sharing` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` int(11) DEFAULT NULL,
  `sharing_type` char(255) DEFAULT NULL,
  `extra` char(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;


CREATE TABLE `$folderdetails` (
  `folder_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `login_id` bigint(20) DEFAULT NULL,
  `folder_parent` bigint(20) DEFAULT NULL,
  `folder_name` char(255) DEFAULT NULL,
  `date_created` date DEFAULT '2008-12-08',
  PRIMARY KEY (`folder_id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

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
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$logindetails` (
  `login_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `username` char(255) DEFAULT NULL,
  `lastlogin` date DEFAULT NULL,
  `firstname` char(255) DEFAULT NULL,
  `surname` char(255) DEFAULT NULL,
  PRIMARY KEY (`login_id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

CREATE TABLE `$originaltemplatesdetails` (
  `template_type_id` bigint(20) NOT NULL AUTO_INCREMENT,
  `template_framework` char(255) DEFAULT NULL,
  `template_name` char(255) DEFAULT NULL,
  `description` char(255) DEFAULT NULL,
  `date_uploaded` date DEFAULT NULL,
  `display_name` char(255) DEFAULT NULL,
  `display_id` bigint(20) DEFAULT NULL,
  `access_rights` char(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`template_type_id`)
) ENGINE=MyISAM AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

insert  into `$originaltemplatesdetails`(`template_type_id`,`template_framework`,`template_name`,`description`,`date_uploaded`,`display_name`,`display_id`,`access_rights`,`active`) values (5,'xerte','Nottingham','A flexible template for creating interactive learning objects.','2009-09-02','Xerte Online Toolkit',0,'*',1),(8,'xerte','Rss','Easily create and maintain an RSS Feed.','2008-04-02','RSS Feed',0,'*',1),(14,'xerte','multipersp','A template for creating learning objects to present multiple perspectives on a topic','2009-07-08','Multiple Perspectives',0,'*',0),(15,'xerte','mediaInteractions','A  template for presenting a piece of media and creating a series of interactions','2009-09-01','Media Interactions',0,'*',0),(16,'xerte','site','Create responsive web sites.','2013-02-02','Website',0,'*',0);;

CREATE TABLE `$play_security_details` (
  `security_id` int(11) NOT NULL AUTO_INCREMENT,
  `security_setting` char(255) DEFAULT NULL,
  `security_data` char(255) DEFAULT NULL,
  `security_info` char(255) DEFAULT NULL,
  PRIMARY KEY (`security_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$sitedetails` (
  `site_id` int(11) NOT NULL AUTO_INCREMENT,
  `site_url` char(255) DEFAULT NULL,
  `apache` char(255) DEFAULT NULL,
  `mimetypes` text,
  `site_session_name` char(255) DEFAULT NULL,
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
  `site_text` char(255) DEFAULT NULL,
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
  PRIMARY KEY (`site_id`)
) ENGINE=MyISAM AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

CREATE TABLE `$syndicationcategories` (
  `category_id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` char(255) DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=MyISAM AUTO_INCREMENT=29 DEFAULT CHARSET=latin1;

insert  into `$syndicationcategories`(`category_id`,`category_name`) values (1,'American and Canadian Studies'),(2,'Biology'),(3,'Biomedical Sciences'),(4,'Biosciences'),(5,'Built Environment, The'),(6,'Centre for English Language Education'),(7,'Chemistry'),(9,'Community Health Sciences'),(10,'Computer Science'),(11,'Contemporary Chinese Studies'),(12,'Economics'),(13,'Education'),(14,'English Studies'),(15,'Geography'),(16,'Medicine and Health'),(17,'History'),(18,'Humanities'),(20,'Mathematical Sciences'),(21,'Modern Languages and Cultures'),(22,'Nursing, Midwifery and Physiotherapy'),(23,'Pharmacy'),(24,'Physics & Astronomy'),(25,'Politics and International Relations'),(26,'Psychology'),(27,'Sociology & Social Policy'),(28,'Veterinary Medicine and Science');

CREATE TABLE `$syndicationlicenses` (
  `license_id` int(11) NOT NULL AUTO_INCREMENT,
  `license_name` char(255) DEFAULT NULL,
  PRIMARY KEY (`license_id`)
) ENGINE=MyISAM AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

insert  into `$syndicationlicenses`(`license_id`,`license_name`) values (6,'Creative Commons Attribution-ShareAlike'),(5,'Creative Commons Attribution-NonCommercial-ShareAlike'),(4,'Creative Commons Attribution-NonCommercial'),(3,'Creative Commons Attribution-NonCommercial-NoDerivs'),(2,'Creative Commons Attribution-NoDerivs');

CREATE TABLE `$templatedetails` (
  `template_id` bigint(20) NOT NULL,
  `creator_id` bigint(20) DEFAULT NULL,
  `template_type_id` bigint(20) DEFAULT NULL,
  `template_name` char(255) DEFAULT NULL,
  `date_created` date DEFAULT NULL,
  `date_modified` date DEFAULT NULL,
  `date_accessed` date DEFAULT NULL,
  `number_of_uses` bigint(20) DEFAULT NULL,
  `access_to_whom` text,
  PRIMARY KEY (`template_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$templaterights` (
  `template_id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `role` text,
  `folder` bigint(20) DEFAULT NULL,
  `notes` char(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$templatesyndication` (
  `template_id` bigint(20) NOT NULL,
  `description` char(255) DEFAULT NULL,
  `keywords` char(255) DEFAULT NULL,
  `rss` text,
  `export` text,
  `syndication` text,
  `category` char(255) DEFAULT NULL,
  `license` char(255) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$user_sessions` (
  `session_id` varchar(32) NOT NULL DEFAULT '',
  `access` int(10) unsigned DEFAULT NULL,
  `data` text,
  PRIMARY KEY (`session_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `$lti_context` (
  `lti_context_key` varchar(255) NOT NULL,
  `c_internal_id` varchar(255) NOT NULL,
  `updated_on` datetime NOT NULL,
  PRIMARY KEY (`lti_context_key`),
  KEY `c_internal_id` (`c_internal_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

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
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `$lti_resource` (
  `lti_resource_key` varchar(255) NOT NULL,
  `internal_id` varchar(255) DEFAULT NULL,
  `internal_type` varchar(255) NOT NULL,
  `updated_on` datetime DEFAULT NULL,
  PRIMARY KEY (`lti_resource_key`),
  KEY `destination2` (`internal_type`),
  KEY `destination` (`internal_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `$lti_user` (
  `lti_user_key` varchar(255) NOT NULL DEFAULT '',
  `lti_user_equ` varchar(255) NOT NULL,
  `updated_on` datetime NOT NULL,
  PRIMARY KEY (`lti_user_key`),
  KEY `lti_user_equ` (`lti_user_equ`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;