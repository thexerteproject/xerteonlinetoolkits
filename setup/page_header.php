<?php 
/**
 * Licensed to The Apereo Foundation under one or more contributor license
 * agreements. See the NOTICE file distributed with this work for
 * additional information regarding copyright ownership.
 *
 * The Apereo Foundation licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at:
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
require_once("../functions.php");
require_once('../website_code/php/database_library.php');
require_once('setup_class_library.php');

$xot_setup = new Setup(); ?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>Xerte Online Toolkits Installer</title>

		<link href="../website_code/styles/frontpage.css" media="screen" type="text/css" rel="stylesheet" />
		<style>

		#logo_img {
			margin-left: 10px;
			float: left;
		}

		#apereo_logo {
			margin-right: 10px;
			float: right;
		}

		a {
			color:#0000FF;
		}

		a:link {
			text-decoration: none;
		}

		a:hover {
			text-decoration: underline;
		}

		a img {
			border:0px;
		}

		h1 {
			 margin-top: 15px;
			 padding-bottom: 10px;
			 border-bottom: 1px solid #d3d3d3;
		}

		textarea {
			float: left;
			width: 90%;
			position: relative;
			clear: left;
		}

		p {
			clear: left;
			font-size: 16px;
		}

		.pagecontainer_holder {
			padding: 20px;
		}

		button, .button {
			font-size: 16px;
			padding: 10px;
			color: #fff;
			background-color: #337ab7;
			line-height: 1.42857143;
			text-align: center;
			white-space: nowrap;
			vertical-align: middle;
		}

		ol li, ul li {
			padding-top: 5px;
		}

		code, kbd {
			font-size: 16px;
		}

		.info {
			font-weight: normal;
		}

		.form_field label {
			display: block;
			font-size: 1.2em;
			font-weight: bold;
			margin-bottom: 10px;
		}

		.form_field input {
			display: block;
		}

		.form_field .form_help {
			display: block;
			margin: 10px 0 20px 0;
			font-size: 0.82em;
		}

		.setup_error {
			color: #F00;
		}
		</style>
	</head>

	<body>

	<div class="topbar">
		<img src="../website_code/images/logo.png" id="logo_img" />
		<img src="../website_code/images/apereoLogo.png" id="apereo_logo" />
	</div>

	<div class="pagecontainer">
		<div class="pagecontainer_holder">

			<h1>Welcome to Xerte Online Toolkits Installer</h1>
