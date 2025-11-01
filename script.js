
// ==================== 常量定义 ====================
const CONSTANTS = {
    // 超时设置
    COMPONENT_LOAD_TIMEOUT: 3000,
    MATERIAL_COMPONENT_READY_DELAY: 100,
    CALCULATE_DELAY: 100,
    NOTIFICATION_DURATION: 3000,
    NOTIFICATION_FADE_DURATION: 300,
    API_TIMEOUT: 10000,

    // 币种
    CURRENCY: {
        USD: 'USD',
        AUD: 'AUD',
        CAD: 'CAD',
        CNY: 'CNY',
        EUR: 'EUR',
        GBP: 'GBP',
        HKD: 'HKD',
        JPY: 'JPY',
        KRW: 'KRW',
        SGD: 'SGD',
        TWD: 'TWD'
    },

    // 续费周期
    CYCLE: {
        MONTHLY: 1,
        QUARTERLY: 3,
        SEMI_ANNUAL: 6,
        ANNUAL: 12,
        BIENNIAL: 24,
        TRIENNIAL: 36,
        QUADRENNIAL: 48,
        QUINQUENNIAL: 60
    },

    // 高价值阈值
    HIGH_VALUE_THRESHOLD: 1000,

    // API 端点
    API_ENDPOINT: 'https://throbbing-sun-9eb6.b7483311.workers.dev',

    // LocalStorage 键
    STORAGE_KEYS: {
        VERSION: 'app_version',
        THEME: 'theme',
        IMG_HOST: 'imgHostSettings'
    }
};

// ==================== 版本检查和缓存管理 ====================
(function() {
    try {
        const storedVersion = localStorage.getItem(CONSTANTS.STORAGE_KEYS.VERSION);
        if (storedVersion !== APP_VERSION) {
            console.log('检测到新版本，清除缓存...');
            const theme = localStorage.getItem(CONSTANTS.STORAGE_KEYS.THEME);
            const imgHostSettings = localStorage.getItem(CONSTANTS.STORAGE_KEYS.IMG_HOST);
            localStorage.clear();
            if (theme) localStorage.setItem(CONSTANTS.STORAGE_KEYS.THEME, theme);
            if (imgHostSettings) localStorage.setItem(CONSTANTS.STORAGE_KEYS.IMG_HOST, imgHostSettings);
            localStorage.setItem(CONSTANTS.STORAGE_KEYS.VERSION, APP_VERSION);
        }
    } catch (error) {
        console.error('LocalStorage 操作失败:', error);
    }
})();

// ==================== 图床配置 ====================
const imgHost = {
    type: "LskyPro", // 图床类型, 仅支持 LskyPro / EasyImages
    url: "https://image.dooo.ng", // 图床地址, 带上协议头
    token: "", // LskyPro 可为空则使用游客上传, 在 /user/tokens 生成
    copyFormat: "markdown" // 默认为URL格式
};

// ==================== DOM 元素缓存 ====================
let DOMCache = {};

/**
 * 初始化 DOM 缓存
 * 缓存常用的 DOM 元素引用以提高性能
 */
function initDOMCache() {
    DOMCache = {
        // 表单元素
        currency: document.getElementById('currency'),
        amount: document.getElementById('amount'),
        cycle: document.getElementById('cycle'),
        expiryDate: document.getElementById('expiryDate'),
        transactionDate: document.getElementById('transactionDate'),
        exchangeRate: document.getElementById('exchangeRate'),
        customRate: document.getElementById('customRate'),

        // 按钮
        calculateBtn: document.getElementById('calculateBtn'),
        copyLinkBtn: document.getElementById('copyLinkBtn'),
        screenshotBtn: document.getElementById('screenshotBtn'),
        themeToggle: document.getElementById('themeToggle'),
        settingsToggle: document.getElementById('settingsToggle'),

        // 结果显示元素
        resultDate: document.getElementById('resultDate'),
        resultForeignRate: document.getElementById('resultForeignRate'),
        resultPrice: document.getElementById('resultPrice'),
        resultDays: document.getElementById('resultDays'),
        resultExpiry: document.getElementById('resultExpiry'),
        resultValue: document.getElementById('resultValue'),
        calcResult: document.getElementById('calcResult'),

        // 设置相关
        settingsSidebar: document.getElementById('settingsSidebar'),
        sidebarOverlay: document.getElementById('sidebarOverlay'),
        closeSidebar: document.getElementById('closeSidebar'),
        saveSettings: document.getElementById('saveSettings'),
        resetSettings: document.getElementById('resetSettings'),
        imgHostType: document.getElementById('imgHostType'),
        imgHostUrl: document.getElementById('imgHostUrl'),
        imgHostToken: document.getElementById('imgHostToken'),
        copyFormatMarkdown: document.getElementById('copyFormatMarkdown'),
        copyFormatUrl: document.getElementById('copyFormatUrl'),
        togglePassword: document.querySelector('.toggle-password')
    };
}

// ==================== 工具函数 ====================

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 重置日期时间到午夜（00:00:00）
 * @param {Date} date - 要重置的日期对象
 * @returns {Date} 重置后的日期对象
 */
function resetTimeToMidnight(date) {
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
}

/**
 * 安全的 LocalStorage 操作
 * @param {string} key - 键名
 * @param {*} value - 值（如果为 undefined 则执行读取操作）
 * @returns {*} 读取操作返回值，写入操作返回 boolean
 */
function safeLocalStorage(key, value) {
    try {
        if (value === undefined) {
            return localStorage.getItem(key);
        } else if (value === null) {
            localStorage.removeItem(key);
            return true;
        } else {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
            return true;
        }
    } catch (error) {
        console.error('LocalStorage 操作失败:', error);
        return value === undefined ? null : false;
    }
}

/**
 * 输入验证函数
 * @param {string} value - 要验证的值
 * @param {string} type - 验证类型
 * @returns {boolean} 验证是否通过
 */
function validateInput(value, type) {
    switch (type) {
        case 'number':
            return !isNaN(parseFloat(value)) && isFinite(value);
        case 'date':
            return /^\d{4}-\d{2}-\d{2}$/.test(value);
        case 'url':
            try {
                new URL(value);
                return value.startsWith('http://') || value.startsWith('https://');
            } catch {
                return false;
            }
        default:
            return value !== null && value !== undefined && value !== '';
    }
}

// ==================== 页面初始化 ====================

document.addEventListener('DOMContentLoaded', function() {

    function showPageAndInitialize() {
        if (document.body.classList.contains('is-loading')) {
            document.body.style.visibility = 'visible';
            document.body.classList.remove('is-loading');
            runInitializations();
        }
    }

    const keyComponents = [
        'md-outlined-text-field',
        'md-outlined-select',
        'md-filled-button'
    ];
    const componentPromises = keyComponents.map(tag => customElements.whenDefined(tag));
    Promise.race(componentPromises).then(() => {
        clearTimeout(safetyTimeout);
        showPageAndInitialize();
    }).catch(error => {
        console.error('Material 组件加载失败:', error);
        clearTimeout(safetyTimeout);
        showPageAndInitialize();
    });

    const safetyTimeout = setTimeout(() => {
        showPageAndInitialize();
    }, CONSTANTS.COMPONENT_LOAD_TIMEOUT);

    function runInitializations() {
        // 初始化 DOM 缓存
        initDOMCache();

        // 初始化 Material Design 3 Snackbar
        NotificationQueue.init();

        // 初始化主题
        initTheme();

        // 初始化日期选择器
        try {
            flatpickr.localize(flatpickr.l10ns.zh);
            initializeDatePickers();
        } catch (error) {
            console.error('日期选择器初始化失败:', error);
        }

        // 初始化其他功能
        fetchExchangeRate();
        setDefaultTransactionDate();

        // 初始化图床设置
        initSettings();

        // 等待 Material Web 组件完全加载后添加事件监听器
        setTimeout(() => {
            attachEventListeners();
        }, CONSTANTS.MATERIAL_COMPONENT_READY_DELAY);

        // 从 URL 参数填充表单
        populateFormFromUrlAndCalc();
    }

    /**
     * 附加所有事件监听器
     */
    function attachEventListeners() {
        // 表单相关事件
        if (DOMCache.currency) {
            DOMCache.currency.addEventListener('change', debounce(fetchExchangeRate, 300));
        }
        if (DOMCache.calculateBtn) {
            DOMCache.calculateBtn.addEventListener('click', calculateAndSend);
        }
        if (DOMCache.copyLinkBtn) {
            DOMCache.copyLinkBtn.addEventListener('click', copyLink);
        }
        if (DOMCache.screenshotBtn) {
            DOMCache.screenshotBtn.addEventListener('click', captureAndUpload);
        }

        // 设置相关事件
        if (DOMCache.settingsToggle) {
            DOMCache.settingsToggle.addEventListener('click', openSettingsSidebar);
        }
        if (DOMCache.closeSidebar) {
            DOMCache.closeSidebar.addEventListener('click', closeSettingsSidebar);
        }
        if (DOMCache.sidebarOverlay) {
            DOMCache.sidebarOverlay.addEventListener('click', closeSettingsSidebar);
        }
        if (DOMCache.saveSettings) {
            DOMCache.saveSettings.addEventListener('click', saveSettings);
        }
        if (DOMCache.resetSettings) {
            DOMCache.resetSettings.addEventListener('click', resetSettings);
        }
        if (DOMCache.togglePassword) {
            DOMCache.togglePassword.addEventListener('click', togglePasswordVisibility);
        }

        // ESC 键关闭侧边栏
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeSettingsSidebar();
            }
        });
    }
});

/**
 * 从 URL 参数填充表单并触发计算
 * 支持参数：c/currency, p/price, y/cycle, d/due, t/transaction, r/rate
 * 短参数名优先，向后兼容长参数名
 */
function populateFormFromUrlAndCalc() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.toString() === '') {
        return; // 无参数，使用默认行为
    }

    // 辅助函数：获取参数值（优先使用短参数名，向后兼容长参数名）
    const getParam = (shortName, longName) => {
        return urlParams.get(shortName) || urlParams.get(longName);
    };

    // 验证并设置币种 (c = currency)
    const currency = getParam('c', 'currency');
    if (currency && Object.values(CONSTANTS.CURRENCY).includes(currency)) {
        DOMCache.currency.value = currency;
    }

    // 验证并设置价格 (p = price)
    const price = getParam('p', 'price');
    if (price && validateInput(price, 'number') && parseFloat(price) > 0) {
        DOMCache.amount.value = price;
    }

    // 验证并设置周期 (y = cycle)
    const cycle = getParam('y', 'cycle');
    if (cycle && Object.values(CONSTANTS.CYCLE).includes(parseInt(cycle))) {
        DOMCache.cycle.value = cycle;
    }

    // 验证并设置到期日期 (d = due)
    const expiryDate = getParam('d', 'due');
    if (expiryDate && /^\d{8}$/.test(expiryDate)) {
        const formattedDate = `${expiryDate.substring(0, 4)}-${expiryDate.substring(4, 6)}-${expiryDate.substring(6, 8)}`;
        if (validateInput(formattedDate, 'date')) {
            DOMCache.expiryDate.value = formattedDate;
        }
    }

    // 验证并设置交易日期 (t = transaction)
    const transactionDate = getParam('t', 'transaction');
    if (transactionDate && /^\d{8}$/.test(transactionDate)) {
        const formattedDate = `${transactionDate.substring(0, 4)}-${transactionDate.substring(4, 6)}-${transactionDate.substring(6, 8)}`;
        if (validateInput(formattedDate, 'date')) {
            DOMCache.transactionDate.value = formattedDate;
        }
    }

    const fetchPromise = fetchExchangeRate(true);

    fetchPromise.then(() => {
        // 验证并设置自定义汇率 (r = rate)
        const rate = getParam('r', 'rate');
        if (rate && validateInput(rate, 'number') && parseFloat(rate) > 0) {
            DOMCache.customRate.value = rate;
        }
        setTimeout(() => {
            calculateAndSend();
        }, CONSTANTS.CALCULATE_DELAY);
    }).catch(error => {
        console.error('从 URL 参数初始化失败:', error);
    });
}

/**
 * 初始化主题设置
 * 支持亮色/暗色主题切换，保存用户偏好
 */
function initTheme() {
    const themeToggle = DOMCache.themeToggle;
    if (!themeToggle) return;

    const themeIcon = themeToggle.querySelector('.material-symbols-outlined');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // 检查本地存储中的主题设置
    const currentTheme = safeLocalStorage(CONSTANTS.STORAGE_KEYS.THEME);

    // 应用保存的主题或系统主题
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = 'light_mode';
    } else if (currentTheme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = 'dark_mode';
    } else if (prefersDarkScheme.matches) {
        // 如果没有保存的主题但系统偏好暗色模式
        document.documentElement.setAttribute('data-theme', 'dark');
        themeIcon.textContent = 'light_mode';
        safeLocalStorage(CONSTANTS.STORAGE_KEYS.THEME, 'dark');
    } else {
        // 默认使用亮色主题
        document.documentElement.setAttribute('data-theme', 'light');
        themeIcon.textContent = 'dark_mode';
        safeLocalStorage(CONSTANTS.STORAGE_KEYS.THEME, 'light');
    }

    // 切换主题
    themeToggle.addEventListener('click', function() {
        let theme;
        if (document.documentElement.getAttribute('data-theme') === 'dark') {
            document.documentElement.setAttribute('data-theme', 'light');
            theme = 'light';
            themeIcon.textContent = 'dark_mode';
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            theme = 'dark';
            themeIcon.textContent = 'light_mode';
        }

        // 保存主题设置到本地存储
        safeLocalStorage(CONSTANTS.STORAGE_KEYS.THEME, theme);
    });
}

function initializeDatePickers() {
    flatpickr("#expiryDate", {
        dateFormat: "Y-m-d",
        locale: "zh",
        placeholder: "选择到期日期",
        minDate: "today",
        onChange: function(_selectedDates, dateStr) {
            const transactionPicker = document.getElementById('transactionDate')._flatpickr;
            transactionPicker.set('maxDate', dateStr);
            validateDates();
        }
    });

    flatpickr("#transactionDate", {
        dateFormat: "Y-m-d",
        locale: "zh",
        placeholder: "选择交易日期",
        onChange: validateDates
    });
}

/**
 * 验证日期输入
 * 检查到期日期和交易日期的有效性
 */
function validateDates() {
    const expiryDateInput = DOMCache.expiryDate.value;
    const transactionDateInput = DOMCache.transactionDate.value;

    if (!expiryDateInput || !transactionDateInput) return;

    const expiryDate = resetTimeToMidnight(new Date(expiryDateInput));
    const transactionDate = resetTimeToMidnight(new Date(transactionDateInput));
    const today = resetTimeToMidnight(new Date());

    // 验证到期日期必须晚于今天
    if (expiryDate <= today) {
        showNotification('到期日期必须晚于今天', 'error');
        DOMCache.expiryDate.value = '';
        return;
    }

    // 验证交易日期不能晚于到期日期
    if (transactionDate >= expiryDate) {
        showNotification('交易日期必须早于到期日期', 'error');
        setDefaultTransactionDate();
        return;
    }

    updateRemainingDays();
}

/**
 * 更新剩余天数显示
 */
function updateRemainingDays() {
    const expiryDate = DOMCache.expiryDate.value;
    const transactionDate = DOMCache.transactionDate.value;

    if (expiryDate && transactionDate) {
        const remainingDays = calculateRemainingDays(expiryDate, transactionDate);

        // 检查是否存在 remainingDays 元素
        const remainingDaysElement = document.getElementById('remainingDays');
        if (remainingDaysElement) {
            remainingDaysElement.textContent = remainingDays;

            if (remainingDays === 0) {
                showNotification('剩余天数为0，请检查日期设置', 'warning');
            }
        }
    }
}

/**
 * 实时汇率获取 @pengzhile
 * 代码来源: https://linux.do/t/topic/227730/27
 *
 * 该函数用于从API获取最新汇率并计算与人民币的兑换比率
 * @param {boolean} isFromUrlLoad - 是否从 URL 参数加载
 * @returns {Promise} 返回 Promise 对象
 */
function fetchExchangeRate(isFromUrlLoad = false) {
    const currency = DOMCache.currency.value;
    const customRateField = DOMCache.customRate;

    // 创建 AbortController 用于超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONSTANTS.API_TIMEOUT);

    return fetch(CONSTANTS.API_ENDPOINT, {
        signal: controller.signal
    })
    .then(response => {
        clearTimeout(timeoutId);
        if (!response.ok) {
            throw new Error(`HTTP error! 状态: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (!data.rates || !data.rates[currency] || !data.rates.CNY) {
            throw new Error('汇率数据格式错误');
        }

        const originRate = data.rates[currency];
        const targetRate = data.rates.CNY;
        const rate = targetRate / originRate;

        const utcDate = new Date(data.timestamp);
        const eastEightTime = new Date(utcDate.getTime() + (8 * 60 * 60 * 1000));

        const year = eastEightTime.getUTCFullYear();
        const month = String(eastEightTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(eastEightTime.getUTCDate()).padStart(2, '0');
        const hours = String(eastEightTime.getUTCHours()).padStart(2, '0');
        const minutes = String(eastEightTime.getUTCMinutes()).padStart(2, '0');

        const formattedDate = `${year}/${month}/${day} ${hours}:${minutes}`;

        DOMCache.exchangeRate.value = rate.toFixed(3);

        const urlParams = new URLSearchParams(window.location.search);
        if (!isFromUrlLoad || !urlParams.has('rate')) {
            customRateField.value = rate.toFixed(3);
        }

        DOMCache.exchangeRate.setAttribute('supporting-text', `更新时间: ${formattedDate}`);
    })
    .catch(error => {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            console.error('汇率获取超时');
            showNotification('获取汇率超时，请检查网络连接', 'error');
        } else {
            console.error('Error fetching the exchange rate:', error);
            showNotification('获取汇率失败，请稍后再试', 'error');
        }
    });
}

/**
 * 设置默认交易日期为今天
 */
function setDefaultTransactionDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const defaultDate = `${year}-${month}-${day}`;
    DOMCache.transactionDate.value = defaultDate;
    if (DOMCache.transactionDate._flatpickr) {
        DOMCache.transactionDate._flatpickr.setDate(defaultDate);
    }
}

/**
 * 计算两个日期之间的剩余天数
 * @param {string} expiryDate - 到期日期 (YYYY-MM-DD)
 * @param {string} transactionDate - 交易日期 (YYYY-MM-DD)
 * @returns {number} 剩余天数
 */
function calculateRemainingDays(expiryDate, transactionDate) {
    const expiry = resetTimeToMidnight(new Date(expiryDate));
    const transaction = resetTimeToMidnight(new Date(transactionDate));

    // 如果到期日早于或等于交易日期，返回0
    if (expiry <= transaction) {
        return 0;
    }

    // 计算天数差异
    const timeDiff = expiry.getTime() - transaction.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

    return daysDiff;
}

/**
 * 计算周期开始日期
 * @param {string} expiryDateStr - 到期日期字符串
 * @param {number} cycleMonths - 周期月数
 * @returns {Date} 周期开始日期
 */
function getCycleStartDate(expiryDateStr, cycleMonths) {
    const end = new Date(expiryDateStr);
    const start = new Date(end);
    start.setMonth(start.getMonth() - cycleMonths);

    if (start.getDate() !== end.getDate()) {
        start.setDate(0);
    }
    return start;
}

/**
 * 计算并发送结果
 * 主要计算函数，计算 VPS 的剩余价值
 */
function calculateAndSend() {
    const customRate = parseFloat(DOMCache.customRate.value);
    const amount = parseFloat(DOMCache.amount.value);
    const cycle = parseInt(DOMCache.cycle.value);
    const expiryDate = DOMCache.expiryDate.value;
    const transactionDate = DOMCache.transactionDate.value;

    // 输入验证
    if (!validateInput(customRate, 'number') || customRate <= 0) {
        showNotification('请输入有效的汇率', 'error');
        return;
    }
    if (!validateInput(amount, 'number') || amount <= 0) {
        showNotification('请输入有效的续费金额', 'error');
        return;
    }
    if (!cycle || cycle === 0) {
        showNotification('请选择续费周期', 'error');
        return;
    }
    if (!validateInput(expiryDate, 'date')) {
        showNotification('请选择有效的到期日期', 'error');
        return;
    }
    if (!validateInput(transactionDate, 'date')) {
        showNotification('请选择有效的交易日期', 'error');
        return;
    }

    const localAmount = amount * customRate;

    // 整个计费周期的天数
    const cycleStart = getCycleStartDate(expiryDate, cycle);
    const totalCycleDays = calculateRemainingDays(expiryDate, cycleStart.toISOString().slice(0, 10));

    // 当前剩余天数
    const remainingDays = calculateRemainingDays(expiryDate, transactionDate);

    if (remainingDays <= 0) {
        showNotification('剩余天数为0或负数，请检查日期设置', 'error');
        return;
    }

    // 真实日费 & 剩余价值
    const dailyValue = localAmount / totalCycleDays;
    const remainingValue = (dailyValue * remainingDays).toFixed(2);

    const data = {
        price: localAmount,
        time: remainingDays,
        customRate,
        amount,
        cycle,
        expiryDate,
        transactionDate,
        bidAmount: 0
    };
    updateResults({ remainingValue }, data);
    showNotification('计算完成！', 'success');

    if (parseFloat(remainingValue) >= CONSTANTS.HIGH_VALUE_THRESHOLD) {
        triggerConfetti();
    }
}


/**
 * 更新计算结果显示
 * @param {Object} result - 计算结果对象
 * @param {Object} data - 数据对象
 */
function updateResults(result, data) {
    DOMCache.resultDate.innerText = data.transactionDate;
    DOMCache.resultForeignRate.innerText = data.customRate.toFixed(3);

    // 计算年化价格
    const price = parseFloat(data.price);
    const cycleText = getCycleText(data.cycle);
    DOMCache.resultPrice.innerText = `${price.toFixed(2)} 人民币/${cycleText}`;

    DOMCache.resultDays.innerText = data.time;
    DOMCache.resultExpiry.innerText = data.expiryDate;

    const resultValueElement = DOMCache.resultValue;

    // 清除旧的事件监听器（通过重新克隆元素）
    const newResultValueElement = resultValueElement.cloneNode(false);
    resultValueElement.parentNode.replaceChild(newResultValueElement, resultValueElement);
    DOMCache.resultValue = newResultValueElement;

    const copyIcon = document.createElement('span');
    copyIcon.className = 'material-symbols-outlined copy-icon';
    copyIcon.textContent = 'content_copy';
    copyIcon.title = '复制到剪贴板';

    newResultValueElement.innerHTML = '';
    newResultValueElement.appendChild(document.createTextNode(`${result.remainingValue} 元 `));
    newResultValueElement.appendChild(copyIcon);

    if (parseFloat(result.remainingValue) >= CONSTANTS.HIGH_VALUE_THRESHOLD) {
        newResultValueElement.classList.add('high-value-result');
    } else {
        newResultValueElement.classList.remove('high-value-result');
    }

    newResultValueElement.style.cursor = 'pointer';

    newResultValueElement.addEventListener('click', function() {
        copyToClipboard(result.remainingValue);
    });

    copyIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        copyToClipboard(result.remainingValue);
    });

    DOMCache.calcResult.scrollIntoView({ behavior: 'smooth' });
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 */
function copyToClipboard(text) {
    // 使用现代 Clipboard API
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('已复制到剪贴板！', 'success');
        }).catch(() => {
            // 回退到传统方法
            fallbackCopyToClipboard(text);
        });
    } else {
        // 回退到传统方法
        fallbackCopyToClipboard(text);
    }
}

/**
 * 回退方案：使用 execCommand 复制到剪贴板
 * @param {string} text - 要复制的文本
 */
function fallbackCopyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);

    textarea.select();
    try {
        document.execCommand('copy');
        showNotification('已复制到剪贴板！', 'success');
    } catch (err) {
        console.error('复制失败:', err);
        showNotification('复制失败，请手动复制', 'error');
    }

    document.body.removeChild(textarea);
}

/**
 * Material Design 3 Snackbar 通知系统
 * 支持多个通知同时显示，新通知堆叠在旧通知上方
 */
const NotificationQueue = {
    container: null,
    activeToasts: [],

    /**
     * 初始化 Toast 容器
     */
    init() {
        this.container = document.getElementById('toastContainer');

        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toastContainer';
            this.container.className = 'toast-container';
            this.container.setAttribute('aria-live', 'polite');
            this.container.setAttribute('aria-atomic', 'false');
            document.body.appendChild(this.container);
        }
    },

    /**
     * 添加并显示通知
     * @param {string} message - 通知消息
     * @param {string} type - 通知类型 (success/error/warning/info)
     * @param {number} duration - 显示时长（毫秒）
     */
    add(message, type = 'info', duration = 3000) {
        if (!this.container) {
            this.init();
        }

        const safeMessage = typeof message === 'string' && message.trim() ? message.trim() : '操作已完成';
        const safeType = typeof type === 'string' ? type.trim().toLowerCase() : 'info';
        const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : CONSTANTS.NOTIFICATION_DURATION;

        this.show({ message: safeMessage, type: safeType, duration: safeDuration });
    },

    /**
     * 创建 Toast 元素
     * @param {Object} options - Toast 配置
     * @returns {HTMLElement} Toast 元素
     */
    createToast({ message, type }) {
        const toast = document.createElement('div');
        const normalizedType = ['success', 'error', 'warning', 'info'].includes(type) ? type : 'info';
        toast.className = `toast toast-${normalizedType}`;
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', normalizedType === 'error' ? 'assertive' : 'polite');

        const iconMap = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };

        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined toast-icon';
        icon.textContent = iconMap[normalizedType];

        const messageWrapper = document.createElement('div');
        messageWrapper.className = 'toast-message';
        messageWrapper.textContent = message;

        toast.appendChild(icon);
        toast.appendChild(messageWrapper);

        return toast;
    },

    /**
     * 显示通知
     * @param {Object} payload - 通知配置
     */
    show(payload) {
        const element = this.createToast(payload);
        const toastInfo = { element, hideTimer: null };

        this.activeToasts.push(toastInfo);
        this.container.appendChild(element);

        requestAnimationFrame(() => {
            element.classList.add('toast-visible');
        });

        const hideToast = () => {
            if (!element || element.classList.contains('toast-hide')) {
                return;
            }
            element.classList.remove('toast-visible');
            element.classList.add('toast-hide');
        };

        const finish = () => {
            if (!element) {
                return;
            }
            element.removeEventListener('transitionend', onTransitionEnd);
            if (element.parentNode === this.container) {
                this.container.removeChild(element);
            }
            clearTimeout(toastInfo.hideTimer);
            const index = this.activeToasts.indexOf(toastInfo);
            if (index > -1) {
                this.activeToasts.splice(index, 1);
            }
        };

        const onTransitionEnd = (event) => {
            if (event.propertyName !== 'opacity' || !element.classList.contains('toast-hide')) {
                return;
            }
            finish();
        };

        element.addEventListener('transitionend', onTransitionEnd);

        toastInfo.hideTimer = setTimeout(() => {
            hideToast();
        }, payload.duration);
    }
};

/**
 * 显示通知消息（使用 Material Design 3 Snackbar）
 * @param {string} message - 通知消息
 * @param {string} type - 通知类型 (success/error/warning/info)
 */
function showNotification(message, type = 'info') {
    NotificationQueue.add(message, type, CONSTANTS.NOTIFICATION_DURATION);
}

/**
 * 捕获计算结果并上传到图床
 */
function captureAndUpload() {
    // 检查是否有计算结果
    const resultValue = DOMCache.resultValue;
    if (!resultValue || resultValue.textContent.trim() === '0.000 元') {
        showNotification('请先计算剩余价值再截图', 'error');
        return;
    }

    // 显示加载中通知
    showNotification('正在生成截图...', 'info');

    // 使用 html2canvas 捕获结果区域
    const devicePixelRatio = window.devicePixelRatio || 1;
    const scale = Math.min(devicePixelRatio, 2); // 最大 2 倍缩放

    html2canvas(DOMCache.calcResult, {
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--card-background-color'),
        scale: scale,
        logging: false,
        useCORS: true
    }).then(function(canvas) {
        showNotification('截图生成成功，正在上传...', 'info');

        // 转换为 base64 数据 URL
        const imageData = canvas.toDataURL('image/png');

        // 上传到选定的图床
        uploadImage(imageData);
    }).catch(function(error) {
        console.error('截图生成失败:', error);
        showNotification('截图生成失败，请重试', 'error');
    });
}

/**
 * 将图片上传到配置的图床
 * @param {string} imageData - base64 格式的图像数据
 */
function uploadImage(imageData) {
    // 从 base64 数据创建 Blob
    const byteString = atob(imageData.split(',')[1]);
    const mimeType = imageData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], {type: mimeType});
    const file = new File([blob], "calculator-result.png", {type: mimeType});
    
    // 根据图床类型选择不同的上传方法
    switch(imgHost.type) {
        case 'LskyPro':
            uploadToLskyPro(file);
            break;
        case 'EasyImages':
            uploadToEasyImages(file);
            break;
        default:
            showNotification(`不支持的图床类型: ${imgHost.type}，请设置为 LskyPro 或 EasyImages`, 'error');
    }
}

/**
 * 上传到 LskyPro 图床
 * 代码参考: https://greasyfork.org/zh-CN/scripts/487553-nodeseek-%E7%BC%96%E8%BE%91%E5%99%A8%E5%A2%9E%E5%BC%BA
 * 
 * @param {File} file - 要上传的文件
 */
function uploadToLskyPro(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    const headers = {
        'Accept': 'application/json'
    };
    
    if (imgHost.token) {
        headers['Authorization'] = `Bearer ${imgHost.token}`;
    }
    
    fetch(`${imgHost.url}/api/v1/upload`, {
        method: 'POST',
        headers: headers,
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.status === true && data.data && data.data.links) {
            // 获取图片URL
            const imageUrl = data.data.links.url;
            let clipboardText = imageUrl;
            
            // 如果设置为Markdown格式，则生成Markdown格式的文本
            if (imgHost.copyFormat === 'markdown') {
                clipboardText = `![剩余价值计算结果](${imageUrl})`;
            }
            
            // 复制到剪贴板
            copyToClipboard(clipboardText);
            
            // 显示通知，指明使用了哪种格式
            const formatText = imgHost.copyFormat === 'markdown' ? 'Markdown格式' : '链接';
            showNotification(`截图上传成功，${formatText}已复制到剪贴板！`, 'success');
        } else {
            showNotification('图片上传失败', 'error');
            console.error('上传响应异常:', data);
        }
    })
    .catch(error => {
        console.error('上传图片失败:', error);
        showNotification('上传图片失败，请重试', 'error');
    });
}

/**
 * 上传到 EasyImages 图床 
 * 代码参考: https://greasyfork.org/zh-CN/scripts/487553-nodeseek-%E7%BC%96%E8%BE%91%E5%99%A8%E5%A2%9E%E5%BC%BA
 * 
 * @param {File} file - 要上传的文件
 */
function uploadToEasyImages(file) {
    const formData = new FormData();
    let url = imgHost.url;
    
    if (imgHost.token) {
        // 使用后端API
        url += '/api/index.php';
        formData.append('token', imgHost.token);
        formData.append('image', file);
    } else {
        // 使用前端API
        url += '/app/upload.php';
        formData.append('file', file);
        formData.append('sign', Math.floor(Date.now() / 1000));
    }
    
    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.code === 200 && data.url) {
            // 获取图片URL
            const imageUrl = data.url;
            let clipboardText = imageUrl;
            
            // 如果设置为Markdown格式，则生成Markdown格式的文本
            if (imgHost.copyFormat === 'markdown') {
                clipboardText = `![剩余价值计算结果](${imageUrl})`;
            }
            
            // 复制到剪贴板
            copyToClipboard(clipboardText);
            
            // 显示通知，指明使用了哪种格式
            const formatText = imgHost.copyFormat === 'markdown' ? 'Markdown格式' : '链接';
            showNotification(`截图上传成功，${formatText}已复制到剪贴板！`, 'success');
        } else {
            showNotification('图片上传失败', 'error');
            console.error('上传响应异常:', data);
        }
    })
    .catch(error => {
        console.error('上传图片失败:', error);
        showNotification('上传图片失败，请重试', 'error');
    });
}




/**
 * 初始化设置界面
 * 从 LocalStorage 加载保存的图床设置
 */
function initSettings() {
    const savedSettings = safeLocalStorage(CONSTANTS.STORAGE_KEYS.IMG_HOST);

    try {
        if (savedSettings) {
            // 不是第一次启动，加载保存的设置
            const parsedSettings = JSON.parse(savedSettings);

            imgHost.type = parsedSettings.type || imgHost.type;
            imgHost.url = parsedSettings.url || imgHost.url;
            imgHost.token = parsedSettings.token || imgHost.token;
            imgHost.copyFormat = parsedSettings.copyFormat || imgHost.copyFormat;
        }

        // 更新 UI
        if (DOMCache.imgHostType) DOMCache.imgHostType.value = imgHost.type;
        if (DOMCache.imgHostUrl) DOMCache.imgHostUrl.value = imgHost.url;
        if (DOMCache.imgHostToken) DOMCache.imgHostToken.value = imgHost.token || '';

        if (imgHost.copyFormat === 'markdown') {
            if (DOMCache.copyFormatMarkdown) DOMCache.copyFormatMarkdown.checked = true;
        } else {
            if (DOMCache.copyFormatUrl) DOMCache.copyFormatUrl.checked = true;
        }
    } catch (error) {
        console.error('初始化设置失败:', error);
        showNotification('加载设置失败，使用默认配置', 'warning');
    }
}

/**
 * 打开设置侧边栏
 */
function openSettingsSidebar() {
    const sidebar = document.getElementById('settingsSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.add('active');
    overlay.classList.add('active');

    // 防止背景滚动
    document.body.style.overflow = 'hidden';
}

/**
 * 关闭设置侧边栏
 */
function closeSettingsSidebar() {
    const sidebar = document.getElementById('settingsSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    sidebar.classList.remove('active');
    overlay.classList.remove('active');

    // 恢复背景滚动
    document.body.style.overflow = '';
}

/**
 * 保存设置 - 适配 Material Web 组件
 */
function saveSettings() {
    const type = DOMCache.imgHostType.value;
    const url = DOMCache.imgHostUrl.value;
    const token = DOMCache.imgHostToken.value;

    // 获取选中的复制格式 - 适配 Material Web md-radio 组件
    let copyFormat = 'markdown';
    const markdownRadio = DOMCache.copyFormatMarkdown;
    const urlRadio = DOMCache.copyFormatUrl;

    if (markdownRadio && markdownRadio.checked) {
        copyFormat = 'markdown';
    } else if (urlRadio && urlRadio.checked) {
        copyFormat = 'url';
    }

    // 验证 URL
    if (!validateInput(url, '')) {
        showNotification('图床地址不能为空', 'error');
        return;
    }

    if (!validateInput(url, 'url')) {
        showNotification('图床地址格式不正确，必须包含 http:// 或 https://', 'error');
        return;
    }

    // 更新 imgHost 对象
    imgHost.type = type;
    imgHost.url = url;
    imgHost.token = token;
    imgHost.copyFormat = copyFormat;

    const saved = safeLocalStorage(CONSTANTS.STORAGE_KEYS.IMG_HOST, imgHost);
    if (saved) {
        showNotification('设置已保存', 'success');
        closeSettingsSidebar();
    } else {
        showNotification('设置保存失败，可能是浏览器限制', 'error');
    }
}


function resetSettings() {
    if (confirm('确定要恢复默认设置吗？')) {
        // 使用对象属性更新
        imgHost.type = "LskyPro";
        imgHost.url = "https://image.dooo.ng";
        imgHost.token = "";
        imgHost.copyFormat = "markdown";
        
        // 更新表单值
        document.getElementById('imgHostType').value = imgHost.type;
        document.getElementById('imgHostUrl').value = imgHost.url;
        document.getElementById('imgHostToken').value = imgHost.token;
        document.getElementById('copyFormatMarkdown').checked = true;
        
        // 保存到本地存储
        try {
            localStorage.setItem('imgHostSettings', JSON.stringify(imgHost));
            showNotification('已恢复默认设置', 'success');
        } catch (error) {
            showNotification('设置重置失败，可能是浏览器限制', 'error');
        }
    }
}


function togglePasswordVisibility() {
    const passwordInput = document.getElementById('imgHostToken');
    const toggleBtn = document.querySelector('.toggle-password .material-symbols-outlined');

    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.textContent = 'visibility_off';
    } else {
        passwordInput.type = 'password';
        toggleBtn.textContent = 'visibility';
    }
}


function triggerConfetti() {
    confetti({
        particleCount: 15,
        angle: 60,
        spread: 40,
        origin: { x: 0 },
        colors: ['#FFD700'],
        zIndex: 2000
    });
    
    confetti({
        particleCount: 15,
        angle: 120,
        spread: 40,
        origin: { x: 1 },
        colors: ['#FFD700'],
        zIndex: 2000
    });  
}

function getCycleText(cycle) {
    switch(parseInt(cycle)) {
        case 1: return '月';
        case 3: return '季度';
        case 6: return '半年';
        case 12: return '年';
        case 24: return '两年';
        case 36: return '三年';
        case 48: return '四年';
        case 60: return '五年';
        default: return '未知周期';
    }
}

function copyLink() {
    const currency = document.getElementById('currency').value;
    const price = document.getElementById('amount').value;
    const cycle = document.getElementById('cycle').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const transactionDate = document.getElementById('transactionDate').value;
    const customRate = document.getElementById('customRate').value;

    const params = new URLSearchParams();
    // 使用短参数名优化链接长度
    if (currency) params.set('c', currency);
    if (price) params.set('p', price);
    if (cycle) params.set('y', cycle);
    if (expiryDate) params.set('d', expiryDate.replace(/-/g, ''));
    if (transactionDate) params.set('t', transactionDate.replace(/-/g, ''));
    if (customRate) params.set('r', customRate);

    const url = new URL(window.location.href);
    url.search = params.toString();

    copyToClipboard(url.toString());
}
