// when doing local test, set:
//   baseContentUrl = "./dist/'

// When deploying to server:
//   baseContentUrl = 'https://YOUR-URL'

export class Config {
    public static baseContentUrl = 'http://widgets.skyecard.com.au.s3-ap-southeast-2.amazonaws.com';    // for remote deploy
    //public static baseContentUrl = './dist';       // for local testing
    public static skyePlansUrl = 'https://0eyvhkany4.execute-api.ap-southeast-2.amazonaws.com/dev/'

    // price-info modal
    public static priceInfoModalId = 'skye-dialog-';
    public static priceInfoUrl = Config.baseContentUrl + '/content/html/skye.html';

    // calculator modal (current)
    public static calcInfoModalId = 'calc-dialog-';
    public static calcInfoUrl = Config.baseContentUrl + '/content/html/calculator.html';

}
