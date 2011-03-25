CREATE TABLE `$additional_sharing` (
  `id` int(11) NOT NULL auto_increment,
  `template_id` int(11) default NULL,
  `sharing_type` char(255) default NULL,
  `extra` char(255) default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$folderdetails` (
  `folder_id` bigint(20) NOT NULL auto_increment,
  `login_id` bigint(20) default NULL,
  `folder_parent` bigint(20) default NULL,
  `folder_name` char(255) default NULL,
  `date_created` date default '2008-12-08',
  PRIMARY KEY  (`folder_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$logindetails` (
  `login_id` bigint(20) NOT NULL auto_increment,
  `username` char(255) default NULL,
  `lastlogin` date default NULL,
  `firstname` char(255) default NULL,
  `surname` char(255) default NULL,
  PRIMARY KEY  (`login_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$originaltemplatesdetails` (
  `template_type_id` bigint(20) NOT NULL auto_increment,
  `template_framework` char(255) default NULL,
  `template_name` char(255) default NULL,
  `description` char(255) default NULL,
  `date_uploaded` date default NULL,
  `display_name` char(255) default NULL,
  `display_id` bigint(20) default NULL,
  `access_rights` char(255) default NULL,
  `active` tinyint(1) default NULL,
  PRIMARY KEY  (`template_type_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

insert  into `$originaltemplatesdetails`(`template_type_id`,`template_framework`,`template_name`,`description`,`date_uploaded`,`display_name`,`display_id`,`access_rights`,`active`) values (5,'xerte','Nottingham','A flexible template for creating interactive learning objects.','2009-09-02','Xerte Online Toolkit',0,'*',1),(8,'xerte','Rss','Easily create and maintain an RSS Feed.','2008-04-02','RSS Feed',0,'*',1),(14,'xerte','multipersp','A template for creating learning objects to present multiple perspectives on a topic','2009-07-08','Multiple Perspectives ',0,'*',1),(15,'xerte','mediaInteractions','A  template for presenting a piece of media and creating a series of interactions ','2009-09-01','Media Interactions',0,'*',1);

CREATE TABLE `$play_security_details` (
  `security_id` int(11) NOT NULL auto_increment,
  `security_setting` char(255) default NULL,
  `security_data` char(255) default NULL,
  `security_info` char(255) default NULL,
  PRIMARY KEY  (`security_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$sitedetails` (
  `site_id` int(11) NOT NULL auto_increment,
  `site_url` char(255) default NULL,
  `apache` char(255) default NULL,
  `mimetypes` text default NULL,
  `site_session_name` char(255) default NULL,
  `LDAP_preference` char(255) default NULL,
  `LDAP_filter` char(255) default NULL,
  `integration_config_path` char(255) default NULL,
  `admin_username` char(255) default NULL,
  `admin_password` char(255) default NULL,
  `site_title` char(255) default NULL,
  `site_name` char(255) default NULL,
  `site_logo` char(255) default NULL,
  `organisational_logo` char(255) default NULL,
  `welcome_message` char(255) default NULL,
  `site_text` char(255) default NULL,
  `news_text` text,
  `pod_one` text,
  `pod_two` text,
  `copyright` char(255) default NULL,
  `rss_title` char(255) default NULL,
  `synd_publisher` char(255) default NULL,
  `synd_rights` char(255) default NULL,
  `synd_license` char(255) default NULL,
  `demonstration_page` char(255) default NULL,
  `form_string` text,
  `peer_form_string` text,
  `module_path` char(255) default NULL,
  `website_code_path` char(255) default NULL,
  `users_file_area_short` char(255) default NULL,
  `php_library_path` char(255) default NULL,
  `import_path` char(255) default NULL,
  `root_file_path` char(255) default NULL,
  `play_edit_preview_query` text,
  `error_log_path` char(255) default NULL,
  `email_error_list` char(255) default NULL,
  `error_log_message` char(255) default NULL,
  `max_error_size` char(255) default NULL,
  `error_email_message` char(255) default NULL,
  `ldap_host` char(255) default NULL,
  `ldap_port` char(255) default NULL,
  `bind_pwd` char(255) default NULL,
  `basedn` char(255) default NULL,
  `bind_dn` char(255) default NULL,
  `flash_save_path` char(255) default NULL,
  `flash_upload_path` char(255) default NULL,
  `flash_preview_check_path` char(255) default NULL,
  `flash_flv_skin` char(255) default NULL,
  `site_email_account` char(255) default NULL,
  `headers` char(255) default NULL,
  `email_to_add_to_username` char(255) default NULL,
  `proxy1` char(255) default NULL,
  `port1` char(255) default NULL,
  `feedback_list` char(255) default NULL,
  PRIMARY KEY  (`site_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$syndicationcategories` (
  `category_id` int(11) NOT NULL auto_increment,
  `category_name` char(255) default NULL,
  PRIMARY KEY  (`category_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

insert  into `$syndicationcategories`(`category_id`,`category_name`) values (1,'American and Canadian Studies'),(2,'Biology'),(3,'Biomedical Sciences'),(4,'Biosciences '),(5,'Built Environment, The '),(6,'Centre for English Language Education'),(7,'Chemistry'),(9,'Community Health Sciences'),(10,'Computer Science '),(11,'Contemporary Chinese Studies'),(12,'Economics'),(13,'Education'),(14,'English Studies'),(15,'Geography'),(16,'Medicine and Health'),(17,'History'),(18,'Humanities'),(20,'Mathematical Sciences'),(21,'Modern Languages and Cultures'),(22,'Nursing, Midwifery and Physiotherapy'),(23,'Pharmacy '),(24,'Physics & Astronomy '),(25,'Politics and International Relations'),(26,'Psychology '),(27,'Sociology & Social Policy'),(28,'Veterinary Medicine and Science');

CREATE TABLE `$syndicationlicenses` (
  `license_id` int(11) NOT NULL auto_increment,
  `license_name` char(255) default NULL,
  PRIMARY KEY  (`license_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

insert  into `$syndicationlicenses`(`license_id`,`license_name`) values (6,'Creative Commons Attribution-ShareAlike'),(5,'Creative Commons Attribution-NonCommercial-ShareAlike'),(4,'Creative Commons Attribution-NonCommercial'),(3,'Creative Commons Attribution-NonCommercial-NoDerivs'),(2,'Creative Commons Attribution-NoDerivs');

CREATE TABLE `$templatedetails` (
  `template_id` bigint(20) NOT NULL,
  `creator_id` bigint(20) default NULL,
  `template_type_id` bigint(20) default NULL,
  `template_name` char(255) default NULL,
  `date_created` date default NULL,
  `date_modified` date default NULL,
  `date_accessed` date default NULL,
  `number_of_uses` bigint(20) default NULL,
  `access_to_whom` text,
  PRIMARY KEY  (`template_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$templaterights` (
  `template_id` bigint(20) NOT NULL,
  `user_id` bigint(20) default NULL,
  `role` text,
  `folder` bigint(20) default NULL,
  `notes` char(255) default NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

CREATE TABLE `$templatesyndication` (
  `template_id` bigint(20) NOT NULL,
  `description` char(255) default NULL,
  `keywords` char(255) default NULL,
  `rss` text,
  `export` text,
  `syndication` text,
  `category` char(255) default NULL,
  `license` char(255) default NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;