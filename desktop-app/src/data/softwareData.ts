import type { Software } from '../types/software';

export const SOFTWARE_DATA: Software[] = [
  {
    id: 'php',
    name: 'PHP',
    category: 'programming',
    description: 'Non-Thread-Safe (NTS) builds for Windows',
    icon: 'devicon-php-plain colored',
    versions: [
      { label: '8.4.12', url: 'https://windows.php.net/downloads/releases/archives/php-8.4.12-nts-Win32-vs17-x64.zip' },
      { label: '8.3.28', url: 'https://windows.php.net/downloads/releases/archives/php-8.3.28-nts-Win32-vs16-x64.zip' },
      { label: '8.2.28', url: 'https://windows.php.net/downloads/releases/archives/php-8.2.28-nts-Win32-vs16-x64.zip' },
      { label: '8.1.32', url: 'https://windows.php.net/downloads/releases/archives/php-8.1.32-nts-Win32-vs16-x64.zip' },
    ],
  },
  {
    id: 'apache',
    name: 'Apache',
    category: 'webserver',
    description: 'Apache HTTP Server',
    icon: 'devicon-apache-plain-wordmark colored',
    versions: [
      { label: '2.4.66', url: 'https://www.apachelounge.com/download/VS18/binaries/httpd-2.4.66-260223-Win64-VS18.zip' },
      { label: '2.4.65', url: 'https://www.apachelounge.com/download/VS17/binaries/httpd-2.4.65-250724-Win64-VS17.zip' },
      { label: '2.4.57', url: 'https://www.apachelounge.com/download/VS16/binaries/httpd-2.4.57-win64-VS16.zip' },
    ],
  },
  {
    id: 'nginx',
    name: 'Nginx',
    category: 'webserver',
    description: 'Lightweight web server',
    icon: 'devicon-nginx-original colored',
    versions: [
      { label: '1.29.5', url: 'https://nginx.org/download/nginx-1.29.5.zip' },
    ],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    category: 'nodejs',
    description: 'JavaScript runtime',
    icon: 'devicon-nodejs-plain colored',
    versions: [
      { label: '25.2.1', url: 'https://nodejs.org/dist/v25.2.1/node-v25.2.1-win-x64.zip' },
      { label: '24.12.0', url: 'https://nodejs.org/dist/v24.12.0/node-v24.12.0-win-x64.zip' },
      { label: '22.21.1', url: 'https://nodejs.org/dist/v22.21.1/node-v22.21.1-win-x64.zip' },
    ],
  },
  {
    id: 'mysql',
    name: 'MySQL',
    category: 'database',
    description: 'MySQL Database Server',
    icon: 'devicon-mysql-plain colored',
    versions: [
      { label: '9.6.0', url: 'https://dev.mysql.com/get/Downloads/MySQL-9.6/mysql-9.6.0-winx64.zip' },
      { label: '9.4.0', url: 'https://dev.mysql.com/get/Downloads/MySQL-9.4/mysql-9.4.0-winx64.zip' },
      { label: '8.4.6', url: 'https://dev.mysql.com/get/Downloads/MySQL-8.4/mysql-8.4.6-winx64.zip' },
      { label: '8.0.40', url: 'https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-8.0.40-winx64.zip' },
      { label: '5.7.39', url: 'https://dev.mysql.com/get/Downloads/MySQL-5.7/mysql-5.7.39-winx64.zip' },
    ],
  },
  {
    id: 'postgresql',
    name: 'PostgreSQL',
    category: 'database',
    description: 'PostgreSQL Database Server',
    icon: 'devicon-postgresql-plain colored',
    versions: [
      { label: '18.2', url: 'https://sbp.enterprisedb.com/getfile.jsp?fileid=1260010' },
      { label: '18.0', url: 'https://sbp.enterprisedb.com/getfile.jsp?fileid=1259741' },
      { label: '17.2', url: 'https://sbp.enterprisedb.com/getfile.jsp?fileid=1259294' },
      { label: '16.6', url: 'https://sbp.enterprisedb.com/getfile.jsp?fileid=1259297' },
      { label: '15.10', url: 'https://sbp.enterprisedb.com/getfile.jsp?fileid=1259300' },
    ],
  },
  {
    id: 'mongodb',
    name: 'MongoDB',
    category: 'database',
    description: 'NoSQL Document Database',
    icon: 'devicon-mongodb-plain colored',
    versions: [
      { label: '8.0.4', url: 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-8.0.4.zip' },
      { label: '7.0.14', url: 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.14.zip' },
    ],
  },
  {
    id: 'redis',
    name: 'Redis',
    category: 'database',
    description: 'In-memory data structure store',
    icon: 'devicon-redis-plain colored',
    versions: [
      { label: '8.6.2', url: 'https://github.com/redis-windows/redis-windows/releases/download/8.6.2/Redis-8.6.2-Windows-x64-msys2.zip' }
    ]
  },
  {
    id: 'phpmyadmin',
    name: 'phpMyAdmin',
    category: 'database',
    description: 'MySQL web admin tool',
    icon: 'devicon-php-plain colored',
    versions: [
      { label: '6.0 snapshot', url: 'https://files.phpmyadmin.net/snapshots/phpMyAdmin-6.0+snapshot-english.tar.xz' },
      { label: '5.2.3', url: 'https://files.phpmyadmin.net/phpMyAdmin/5.2.3/phpMyAdmin-5.2.3-all-languages.zip' },
    ],
  },
  {
    id: 'golang',
    name: 'Go',
    category: 'programming',
    description: 'Go Programming Language',
    icon: 'devicon-go-original-wordmark colored',
    versions: [
      { label: '1.24.1', url: 'https://go.dev/dl/go1.24.1.windows-amd64.zip' },
      { label: '1.23.4', url: 'https://go.dev/dl/go1.23.4.windows-amd64.zip' },
    ],
  },
];

export const CATEGORY_LABELS: Record<string, string> = {
  programming: 'Programming Languages',
  webserver: 'Web Server',
  nodejs: 'Node.js',
  database: 'Database',
};

export const CATEGORY_ORDER = ['programming', 'webserver', 'nodejs', 'database'];
