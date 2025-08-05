<?php
/**
 * Configuration phpMyAdmin pour Fusepoint Platform
 * Copier ce fichier vers /opt/homebrew/etc/phpmyadmin.config.inc.php
 */

$cfg['blowfish_secret'] = '7e0a674a182ed91fbd64b950bf0b022ad8e1d61096c60e8636e140bedad4bb0d';

$i = 0;

/* Serveur MariaDB Fusepoint */
$i++;
$cfg['Servers'][$i]['auth_type'] = 'cookie';
$cfg['Servers'][$i]['host'] = 'localhost';
$cfg['Servers'][$i]['port'] = '3306';
$cfg['Servers'][$i]['connect_type'] = 'tcp';
$cfg['Servers'][$i]['compress'] = false;
$cfg['Servers'][$i]['extension'] = 'mysqli';
$cfg['Servers'][$i]['AllowNoPassword'] = false;

/* Configuration pour la base de données Fusepoint */
$cfg['Servers'][$i]['user'] = 'oliveirasamuel';
$cfg['Servers'][$i]['password'] = 'FusepointDB2025!';
$cfg['Servers'][$i]['only_db'] = 'fusepoint_db';

/* Paramètres généraux */
$cfg['UploadDir'] = '';
$cfg['SaveDir'] = '';
$cfg['DefaultLang'] = 'fr';
$cfg['ServerDefault'] = 1;

/* Interface utilisateur */
$cfg['ThemeDefault'] = 'pmahomme';
$cfg['NavigationTreePointerEnable'] = true;
$cfg['BrowsePointerEnable'] = true;
$cfg['BrowseMarkerEnable'] = true;

/* Sécurité */
$cfg['ForceSSL'] = false;
$cfg['CheckConfigurationPermissions'] = false;

/* Fonctionnalités avancées */
$cfg['Servers'][$i]['bookmarktable'] = 'pma__bookmark';
$cfg['Servers'][$i]['relation'] = 'pma__relation';
$cfg['Servers'][$i]['userpreferences'] = 'pma__userconfig';
$cfg['Servers'][$i]['table_info'] = 'pma__table_info';
$cfg['Servers'][$i]['column_info'] = 'pma__column_info';
$cfg['Servers'][$i]['history'] = 'pma__history';
$cfg['Servers'][$i]['recent'] = 'pma__recent';
$cfg['Servers'][$i]['favorite'] = 'pma__favorite';
$cfg['Servers'][$i]['table_uiprefs'] = 'pma__table_uiprefs';
$cfg['Servers'][$i]['tracking'] = 'pma__tracking';
$cfg['Servers'][$i]['usergroups'] = 'pma__usergroups';
$cfg['Servers'][$i]['users'] = 'pma__users';
$cfg['Servers'][$i]['central_columns'] = 'pma__central_columns';
$cfg['Servers'][$i]['designer_settings'] = 'pma__designer_settings';
$cfg['Servers'][$i]['export_templates'] = 'pma__export_templates';
$cfg['Servers'][$i]['savedsearches'] = 'pma__savedsearches';
$cfg['Servers'][$i]['navigationhiding'] = 'pma__navigationhiding';

?>