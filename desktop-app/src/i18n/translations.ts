export type AppLanguage = 'en' | 'vi';

export const translations = {
    en: {
        // Layout & Navigation
        'app.dashboard': 'Dashboard',
        'app.downloads': 'Downloads',
        'app.settings': 'Settings',
        'app.terminal': 'Open Terminal',

        // Theme & Options
        'settings.cache.title': 'Clear App Cache',
        'settings.cache.desc': 'Frees up local storage and resets downloaded frontend artifacts.',
        'settings.cache.action': 'Clear Cache',

        // Dashboard
        'dashboard.status.running': 'Running',
        'dashboard.status.stopped': 'Stopped',
        'dashboard.version': 'Version: ',
        'dashboard.empty.title': 'No environments installed',
        'dashboard.empty.desc': 'Download and install environments from the Environments page',
        'dashboard.quickStart': 'Quick Start selected',
        'dashboard.stopSelected': 'Stop selected',
        'dashboard.sections.services': 'System Services (Daemons)',
        'dashboard.sections.languages': 'Languages & Environments',

        // Downloads
        'downloads.tab.programming': 'Programming Languages',
        'downloads.tab.webserver': 'Web Servers',
        'downloads.tab.nodejs': 'NodeJS',
        'downloads.tab.database': 'Database Systems',

        'downloads.card.running': 'Currently Active',
        'downloads.card.installed': 'Installed',
        'downloads.card.install': 'Install',
        'downloads.card.remove': 'Remove',

        // Actions
        'action.start': 'Start',
        'action.stop': 'Stop',
        'action.downloading': 'Downloading...',
        'action.extracting': 'Extracting...',
        'action.configuring': 'Configuring...',
        'action.cleaning': 'Cleaning...',
        'action.openDir': 'Open Config Folder',
        'action.cancel': 'Cancel',
        'action.confirm': 'Confirm',
        'action.removeConfirm': 'Are you sure you want to remove this module?',

        // Settings
        'settings.title': 'System Settings',
        'settings.desc': 'Manage configurations and customizations for Sonna Desktop',
        'settings.theme.title': 'UI Theme',
        'settings.theme.desc': 'Default is Light Mode',
        'settings.theme.action': 'System Default',
        'settings.lang.title': 'Language',
        'settings.lang.desc': 'Select interface language',
        'settings.shutdown.title': 'Quit Application',
        'settings.shutdown.desc': 'Completely close the Sonna Desktop process',
        'settings.shutdown.action': 'Quit',
    },
    vi: {
        // Layout & Navigation
        'app.dashboard': 'Trang chủ',
        'app.downloads': 'Tải môi trường',
        'app.settings': 'Cài đặt',
        'app.terminal': 'Mở cửa sổ lệnh Terminal',

        // Theme & Options
        'settings.cache.title': 'Xóa bộ nhớ đệm (Cache)',
        'settings.cache.desc': 'Giải phóng tài nguyên và dọn dẹp các tập tin kết xuất tạm hệ thống.',
        'settings.cache.action': 'Dọn dẹp',

        // Dashboard
        'dashboard.status.running': 'Đang chạy',
        'dashboard.status.stopped': 'Đã dừng',
        'dashboard.version': 'Phiên bản: ',
        'dashboard.empty.title': 'Chưa có môi trường nào',
        'dashboard.empty.desc': 'Tải và cài đặt môi trường từ trang Tải môi trường',
        'dashboard.quickStart': 'Khởi động đã chọn',
        'dashboard.stopSelected': 'Dừng mạng đã chọn',
        'dashboard.sections.services': 'Cụm Dịch Vụ Máy Chủ (Services)',
        'dashboard.sections.languages': 'Cụm Ngôn Ngữ (Môi trường)',

        // Downloads
        'downloads.tab.programming': 'Ngôn ngữ Lập trình',
        'downloads.tab.webserver': 'Máy chủ Web',
        'downloads.tab.nodejs': 'Node.JS',
        'downloads.tab.database': 'Cơ sở dữ liệu',

        'downloads.card.running': 'Đang hoạt động',
        'downloads.card.installed': 'Đã cài đặt',
        'downloads.card.install': 'Cài đặt',
        'downloads.card.remove': 'Gỡ bỏ',

        // Actions
        'action.start': 'Khởi động',
        'action.stop': 'Dừng',
        'action.downloading': 'Đang tải về...',
        'action.extracting': 'Đang giải nén...',
        'action.configuring': 'Đang cấu hình...',
        'action.cleaning': 'Đang dọn dẹp...',
        'action.openDir': 'Mở thư mục cấu hình',
        'action.cancel': 'Hủy',
        'action.confirm': 'Đồng ý',
        'action.removeConfirm': 'Bạn có chắc chắn muốn gỡ cài đặt công cụ này?',

        // Settings
        'settings.title': 'Cài đặt hệ thống',
        'settings.desc': 'Quản lý các cấu hình và tuỳ biến của Sonna Desktop',
        'settings.theme.title': 'Chủ đề giao diện',
        'settings.theme.desc': 'Mặc định là Sáng (Light Mode)',
        'settings.theme.action': 'Mặc định hệ thống',
        'settings.lang.title': 'Ngôn ngữ',
        'settings.lang.desc': 'Lựa chọn ngôn ngữ hiển thị',
        'settings.shutdown.title': 'Thoát ứng dụng',
        'settings.shutdown.desc': 'Đóng hoàn toàn tiến trình Sonna Desktop',
        'settings.shutdown.action': 'Thoát',
    }
};

export type TranslationKey = keyof typeof translations['en'];
