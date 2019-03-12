// when doing local test, set:
//   baseContentUrl = "./dist/'

// When deploying to server:
//   baseContentUrl = 'https://YOUR-URL'

export class Config {
    //public static baseContentUrl = 'http://widgets.skyecard.com.au.s3-ap-southeast-2.amazonaws.com';    // for remote deploy
    public static baseContentUrl = 'https://d1y94doel0eh42.cloudfront.net'; 
    //public static baseContentUrl = './dist';       // for local testing
    //Skye plans url
    // Point to UAT
    //public static skyePlansUrl = 'https://0eyvhkany4.execute-api.ap-southeast-2.amazonaws.com/dev/';    
    //public static skyePlansUrl = 'https://um1fnbwix7.execute-api.ap-southeast-2.amazonaws.com/dev/';
    // Point to Prod
    //public static skyePlansUrlProd = 'https://vyrvuhxi9a.execute-api.ap-southeast-2.amazonaws.com/production/';
    public static skyePlansUrlProd = 'https://seohn3f7dc.execute-api.ap-southeast-2.amazonaws.com/prod/';
    //Point to UAT
    //public static skyePlansUrlDev = 'https://um1fnbwix7.execute-api.ap-southeast-2.amazonaws.com/dev/';
    public static skyePlansUrlDev = 'https://tiufiw7v0k.execute-api.ap-southeast-2.amazonaws.com/dev/';
    // price-info modal
    public static priceInfoModalId = 'skye-dialog-';
    public static priceInfoUrl = Config.baseContentUrl + '/content/html/skye.html';
    // calculator modal (current)
    public static calcInfoModalId = 'calc-dialog-';
    public static calcInfoUrl = Config.baseContentUrl + '/content/html/calculator.html';

}
