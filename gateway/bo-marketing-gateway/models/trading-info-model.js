var Dictionary = require('open-api-gateway-core/common/lib/dictionary.js');

var TradingInfoModel = {};
module.exports = TradingInfoModel;

// Bitwise flags
/** @typedef {number} */
TradingInfoModel.DataTypes = {
	AccountStatus: 1,
	Quotes: 2,
	Positions: 4,
	Journal: 8,
	SystemMessage: 16,
	Settings: 32,
	Wallet: 64
};

// Bitwise flags
TradingInfoModel.AssetInfoTypes = {
	Basic: 1,
	Stats: 2,
	Favorites: 4
};

TradingInfoModel.SystemMessageTypes = {
	None: 'None',
	WelcomePractice: 'WelcomePractice',
	WelcomePracticeWithRealAccount: 'WelcomePracticeWithRealAccount',
	PhoneVerificationBonus: 'PhoneVerificationBonus',
	PhoneVerificationBonusReceived: 'PhoneVerificationBonusReceived',
	BonusReleased: 'BonusReleased',
	Tradeout: 'Tradeout',
	HolidayEvent: 'HolidayEvent'
};

TradingInfoModel.TradingInfoData = function() {
	// This object will also contain results per TradingInfoModel.DataTypes

	this.token = '';
};

TradingInfoModel.InitialAppDataResponseData = function() {
	this.serverTime  = 0;
	this.accountStatus = undefined;
	this.user = undefined;
	this.tradingSettings = undefined;
	this.assetCategories = undefined;
	this.favoriteAssets = undefined;
	this.quotes = undefined;
	this.assets = undefined;
	this.positions = undefined;
	this.orders = undefined;
};

/**
 * Object for Market data information
 * @param {number} serverTime - Market data server time
 * @param {TradingInfoModel.Quote[]} quotes - Quotes market data
 * @param {TradingInfoModel.Asset[]} assets - Assets market data
 * @constructor
 */
TradingInfoModel.MarketDataInfo = function(serverTime, quotes, assets) {
	this.serverTime = serverTime || 0;
	this.quotes = quotes;
	this.assets = assets;
};

TradingInfoModel.UserTradingSettings = function() {
	this.slMinDistanceRate = 0;
	this.slMaxDistanceRate = 0;
	this.tpMinDistanceRate = 0;
	this.tpMaxDistanceRate = 0;
	this.limitMinDistanceRate = 0;
	this.limitMaxDistanceRate = 0;
	this.assetCategories = null;
	this.warnTradeoutLevel = 0;
	this.tradeoutLevel = 0;
	this.favoriteAssets = null;
};

TradingInfoModel.Quote = function() {
	this.symbol = '';
	this.GUID = '';
	this.open = 0;
	this.bid = 0;
	this.ask = 0;
	this.mid = 0;
	this.high = 0;
	this.low = 0;
	this.pctChange = 0;
	this.longVolume = 0;
	this.shortVolume = 0;
};

TradingInfoModel.AssetWorkingHours = function() {
	this.dailyStartTime = undefined;
	this.dailyEndTime = undefined;
	this.weeklyStartDay = undefined;
	this.weeklyStartTime = undefined;
	this.weeklyEndDay = undefined;
	this.weeklyEndTime = undefined;
};

TradingInfoModel.Asset = function() {
	// Asset general info
	this.symbol = '';
	this.assetName = '';
	this.exchangeCode = '';
	this.assetType = '';
	this.category = '';
	this.contractExpiration = '';
	this.resumeTrading = '';
	this.workingHours = {};//new TradingInfoModel.AssetWorkingHours();

	// Trading related
	this.quotePrecision = 0;
	this.pipValue = 0;
	this.leverage = 1;
	this.amountRange = {};
	this.slippage = 0;
	this.spread = 0;

	this.isActive = false;
	this.isAllowedForTrading = false;
	this.isTradable = false;

	// Social/Crowd etc
	this.popularityWorldwide = 0;
	this.volatility = 0;
	this.isFavorite = false;
};

TradingInfoModel.AssetExpiration = function(symbol, expiration) {
	/** @type {string} */
	this.symbol = symbol || '';
	/** @type {string[]} */
	this.expiration = expiration || null;
};

TradingInfoModel.HistoricalData = function(symbol, endDateTime, intervalType, barCount) {
	this.symbol = symbol;
	this.endDateTime = endDateTime;
	this.inetrvalType = intervalType;
	this.barCount = barCount;
	this.points = [];
};

TradingInfoModel.HistoricalDataPoint = function(dateTime, open, close, low, high) {
	this.dateTime = dateTime;
	this.open = open;
	this.close = close;
	this.low = low;
	this.high = high;
};

TradingInfoModel.AssetStatistics = function(buyRatioAll, buyRatioRegion, buyRatioTopTraders, stars) {
	this.buyRatioAll = parseFloat(buyRatioAll) || 0;
	this.buyRatioRegion = parseFloat(buyRatioRegion) || 0;
	this.buyRatioTopTraders = parseFloat(buyRatioTopTraders) || 0;
	this.popularityStars =  parseInt(stars) || 0;
};

TradingInfoModel.AssetsStatisticsDict = function() {
	/** @type {object.<string, TradingInfoModel.AssetStatistics>} */
	this.global = {};

	/**
	 * A dictionary where the key is the country-code and the value is a dictionary with symbol/buy ratio pairs
	 * @type {object.<string, object.<string, number>>}
	 * */
	this.perCountry = {};
};

// System message
TradingInfoModel.SystemMessage = function(type) {
	/** @type {TradingInfoModel.SystemMessageTypes} */
	this.type  = type || TradingInfoModel.SystemMessageTypes.None;

	/** @type {string} */
	this.id = '';
};

TradingInfoModel.WelcomePracticeMessage = function(bonusAmount) {
	TradingInfoModel.SystemMessage.call(this, TradingInfoModel.SystemMessageTypes.WelcomePractice);

	/** @type {number} */
	this.bonusAmount = bonusAmount || 0;
};

/**
 * A bonus system message
 * @param {TradingInfoModel.SystemMessageTypes|string} type - The system message type
 * @param {string} bonusType - The bonus type
 * @param {number} amount - Bonus amount
 * @constructor
 */
TradingInfoModel.BonusSystemMessage = function(type, bonusType, amount) {
	TradingInfoModel.SystemMessage.call(this, type);
	this.bonusType = bonusType || '';
	this.amount = amount || 0;
};

/**
 * Creates tradeout notification message
 * @constructor
 */
TradingInfoModel.TradeoutNotificationMessage = function() {
	TradingInfoModel.SystemMessage.call(this, TradingInfoModel.SystemMessageTypes.Tradeout);

	/** @type {number} */
	this.closedPositions = 0;
};

/**
 * Creates calender event message
 * @constructor
 */
TradingInfoModel.HolidayEventMessage = function(name, startTime, endTime) {
	TradingInfoModel.SystemMessage.call(this, TradingInfoModel.SystemMessageTypes.HolidayEvent);
	/** @type {string} */
	this.name = name;
	/** @type {string} */
	this.startTime = startTime;
	/** @type {string} */
	this.endTime = endTime;
};

/**
 * Creates AssetsSubscription
 * @constructor
 */
TradingInfoModel.AssetsSubscription = function(partnerId, cc) {
	/** @type {string} */
	this.countryCode = cc || '';
	/** @type {number} */
	this.partnerId = partnerId;
	/** @type {Dictionary} */
	this.symbols = new Dictionary();
};
