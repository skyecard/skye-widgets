import * as jq from 'jquery';
import { ModalInjector } from './modal-injector';
import { Config } from './config';

let widget;

(($: JQueryStatic) => {

    /**
     * The src attribute from the script we are executing e.g
     * <script src="http://tools.skyecard.com.au/scripts/skye-widget.js?foo"
     */
    let srcString: string;
    let scriptElement: any;
    
    widget = new ModalInjector($);

    /* Choose if we want to render the Skye Logo or not */
    let noLogo: boolean;

    /* Choose if we want to monitor price change every half second */
    let monitor: boolean;

    /* Choose if we want to display weekly payments instead of monthly */
    let mode: string;

    /* Option to display payment calculation fixed term instead of relying on what is setup for the merchant*/
    let term: string;
    
    /* Merchant id to check against term conifgured based on amount*/
    let merchantId: string;

    /* You can pass debug=true to the query string to enable console error messages */
    let debug: boolean;

    // You can pass in min="" and max="" in the script tag.
    let min: number;
    let max: number;
    let used_in: string;
    let element: any;    
    let skyePlansUrl: string;
    
    // You can pass in button element class and button text
    let buttonStyle: string;
    let buttonText: string;
    /**
     * The extracted product price from either parsing the content from HTML (via css selector)
     * or a specifically passed in value
     */
    let productPrice: number;

    jq.fn.exists = function () {
        return this.length !== 0;
    };
    

    // get current script
    scriptElement = getCurrentScript();
    if (!scriptElement && !scriptElement.getAttribute('src')) {
        // bail if we don't have anything
        return false;
    }

    srcString = scriptElement.getAttribute('src');
    merchantId = (getParameterByName('id', srcString));
    noLogo    = (getParameterByName('noLogo', srcString) !== null);
    monitor   = (getParameterByName('monitor', srcString) !== null);
    debug     = scriptElement.getAttribute('debug')? true:false;
    min       = scriptElement.dataset.min || 0;
    max       = scriptElement.dataset.max || 999999;
    used_in   = (getParameterByName('used_in', srcString));
    term      = (getParameterByName('term', srcString));
    mode      = (getParameterByName('mode', srcString));
    buttonStyle  = (getParameterByName('buttonStyle', srcString));
    buttonText  = (getParameterByName('buttonText', srcString));

    element = (getParameterByName('element', srcString))? jq(getParameterByName('element', srcString)) : jq(scriptElement);

    let priceStr = getParameterByName('productPrice', srcString);
    
     if (debug) {
        skyePlansUrl = Config.skyePlansUrlDev;
     } else {
         skyePlansUrl = Config.skyePlansUrlProd;
     }

    if (priceStr) {
        priceStr = priceStr.replace(/^\D+/, '');
        productPrice = parseFloat(priceStr.replace(',', ''));

        jq.when(manyRequests(merchantId, productPrice, skyePlansUrl)).then( function (skyePlans: SkyePlan) {                        
            const template: string = generateWidget(merchantId, skyePlans, productPrice, noLogo, min, max, used_in, term, mode, buttonStyle, buttonText);
        
            if (Object.keys(skyePlans).length > 0)
            {            
                term? term : term = skyePlans[Object.keys(skyePlans).length - 1].PrefIntPeriod;
                widget.injectBanner(template, Config.calcInfoUrl, productPrice, merchantId, term, element);
            } else {
                if (term)
                {
                  widget.injectBanner(template, Config.calcInfoUrl, productPrice, merchantId, term, element);
                }
            }

        })
    } else {
        
        // we haven't been passed a URL, try to get the css selector for
        let selector = getParameterByName('price-selector', srcString);
        if (!selector) {
            logDebug("Can't locate an element with selector :  " + selector);
            return false;
        }
        
        let el = jq(selector, document.body);
        
        if (el.exists()) {
            productPrice = extractPrice(el);            
            if (productPrice)
            {
                jq.when(manyRequests(merchantId, productPrice, skyePlansUrl)).then( function (skyePlans: SkyePlan) {                        
                    const template: string = generateWidget(merchantId, skyePlans, productPrice, noLogo, min, max, used_in, term, mode, buttonStyle, buttonText);
        
                    if (Object.keys(skyePlans).length > 0)
                    {            
                        term? term : term = skyePlans[Object.keys(skyePlans).length - 1].PrefIntPeriod;
                        widget.injectBanner(template, Config.calcInfoUrl, productPrice, merchantId, term, element);
                    } else {
                        if (term)
                        {
                            widget.injectBanner(template, Config.calcInfoUrl, productPrice, merchantId, term, element);
                        }
                    }

                })
            }
            // register event handler to update the price
            if (monitor){
                setInterval(function(){
                    let el = jq(selector, document.body);
                    updatePrice(el, jq, noLogo, min, max, used_in, merchantId, term, mode, buttonStyle, buttonText, skyePlansUrl);
                },1000);
            } else {
                el.on("DOMSubtreeModified", function(e) {
                    updatePrice(jq(e.target), jq, noLogo, min, max, used_in, merchantId, term, mode, buttonStyle, buttonText, skyePlansUrl);
                });
            }
        }
    }


    function logDebug(msg: string) {
        if (debug === true) {
            console.log(msg);
        }
    }

    jq(document).on('click','.'+productPrice.toString().replace('.','-'), function() {
        $(this).modal();         
        return false;   
    })
     
})(jq); 

/* Interface for https://apply.flexicards.com.au/Ajax/SearchPlans?merchantId=&amount= */
interface EmptyPlan {
    SkyePlan;
}

interface SkyePlan {
   [index: number]: { TransactionCode: string, Description: string, PrefIntRate: string, PrefIntPeriod: string, HolidayPeriod: string }
}

function extractPrice(el: any) {
    let textValue =  el.text().trim();
    textValue = textValue.replace(/^\D+/, "");
    textValue = textValue.replace(/,/, "");
    return parseFloat(textValue);
}

function generateWidget(merchantId: string, skyePlans: SkyePlan, productPrice: number, noLogo: boolean, min: number, max: number, used_in: string, term: string, mode: string, buttonStyle: string, buttonText: string): string {
    let template;
    let templateCheckout;
    let templatenologo;
    let productPriceDivisor;
    let productPriceStr = productPrice.toString().replace('.','-');
        
    term? productPriceDivisor = term : productPriceDivisor = skyePlans[Object.keys(skyePlans).length - 1].PrefIntPeriod;

    if (productPrice < min){
        template = `<a href=\"#calc-dialog-`+productPriceStr+`\" class=\"`+productPriceStr+`\" id=\"skye-tag\">
                            <p>or </p><p>Interest free with <img src=\"`+Config.baseContentUrl+`/content/images/skye_logo_63x12.png\"></p>
                            <br>
                        </a>`;

        templateCheckout = `<a href=\"#calc-dialog-`+productPriceStr+`\" class=\"`+productPriceStr+`\" id=\"skye-tag\">
                            <p>Interest free with <img src=\"`+Config.baseContentUrl+`/content/images/skye_logo_63x12.png\"></p>
                        </a>`;

        templatenologo = `<a href=\"#calc-dialog-`+productPriceStr+`\" class=\"`+productPriceStr+`\" id=\"skye-tag\" rel="modal:open">
                                <p>or </p><p>Interest free - <strong>find out how</strong></p>
                                <br>
                            </a>`;
    }
    else if (productPrice <= max) {
        
            let productPriceDividedBy = productPrice / productPriceDivisor;

            // Banking Rounding
            let roundedDownProductPrice = Math.floor( productPriceDividedBy * Math.pow(10, 2) ) / Math.pow(10, 2);
            // Compute for weekly
            if (mode == 'weekly')
            {
                let weeklyRoundedDownProductPrice = Math.floor((roundedDownProductPrice * 12/52) * Math.pow(10,2)) / Math.pow(10, 2);
                template = `<a href=\"#calc-dialog-`+productPriceStr+`\" id=\"skye-tag\" class=\"`+productPriceStr+`\">
                            <p>or <b>$${weeklyRoundedDownProductPrice.toFixed(2)}</b> weekly payments </p><p>Interest free with <img src=\"`+Config.baseContentUrl+`/content/images/skye_logo_63x12.png\"> <span class="more-info">more info</span></p>
                            <br>
                        </a>`;

                templateCheckout = `<a href=\"#calc-dialog-`+productPriceStr+`\" id=\"skye-tag\" class=\"`+productPriceStr+`\">
                            <p><b>$${weeklyRoundedDownProductPrice.toFixed(2)}</b> weekly payments </p><p>Interest free with <img src=\"`+Config.baseContentUrl+`/content/images/skye_logo_63x12.png\"> <span class="more-info">more info</span></p>
                        </a>`;

                templatenologo = `<a href=\"#skye-dialog-`+productPriceStr+`\" id=\"skye-tag\" class=\"`+productPriceStr+`\">\n<p>or <b>$`+weeklyRoundedDownProductPrice.toFixed(2)+`</b>/week </p></a>`;
            } else {

                if (mode == 'button')
                {
                    buttonStyle? buttonStyle = buttonStyle : buttonStyle = `button-white`;
                    buttonText? buttonText = buttonText : buttonText = `Calculate`;
                    template = `<a href=\"#calc-dialog-`+productPriceStr+`\" id=\"skye-tag-button\" class=\"`+buttonStyle+` `+productPriceStr+`\">`+buttonText+`</a>`;

                    templateCheckout = `<a href=\"#calc-dialog-`+productPriceStr+`\" id=\"skye-tag-button\" class=\"`+buttonStyle+` `+productPriceStr+`\">`+buttonText+`</a>`;

                } else {
                    if (mode == 'inpage')
                    {
                        template = '<div id="in-page" class="iframe-container"><iframe src=\"'+Config.calcInfoUrl+'?id='+merchantId+'&productPrice='+productPrice+'&mode='+mode+'&terms='+term+'\" frameborder="0" scrolling="no" /></div></div>'
                    } else {
                        template = `<a href=\"#calc-dialog-`+productPriceStr+`\" id=\"skye-tag\" class=\"`+productPriceStr+`\">
                            <p>or `+productPriceDivisor.toString()+` monthly payments of <b>$${roundedDownProductPrice.toFixed(2)}</b></p><p>Interest free with <img src=\"`+Config.baseContentUrl+`/content/images/skye_logo_63x12.png\"> <span class="more-info">more info</span></p>
                            <br>
                        </a>`;

                        templateCheckout = `<a href=\"#calc-dialog-`+productPriceStr+`\" id=\"skye-tag\" class=\"`+productPriceStr+`\">
                            <p>`+productPriceDivisor.toString()+` monthly payments of <b>$${roundedDownProductPrice.toFixed(2)}</b></p><p>Interest free with <img src=\"`+Config.baseContentUrl+`/content/images/skye_logo_63x12.png\"> <span class="more-info">more info</span></p>
                        </a>`;

                        templatenologo = `<a href=\"#skye-dialog-`+productPriceStr+`\" id=\"skye-tag\" class=\"`+productPriceStr+`\">\n<p>or <b>$${roundedDownProductPrice.toFixed(2)}</b>/month </p></a>`;
                    }
                }
            }
    } else {
        return '<a id=\"skye-tag\"></a>'
    }
    if(used_in == "checkout"){
        return templateCheckout;
    }else {
        return (noLogo) ? templatenologo : template;
    }
}

function getCurrentScript(): any {

    let currentScript = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();

    return currentScript;
}

function updatePrice(el: JQuery, jq: JQueryStatic, noLogo: boolean, min: number, max: number, used_in: string, merchantId: string, term: string, mode: string, buttonStyle: string, buttonText: string, skyePlansUrl: string) {
    let productPrice = extractPrice(el);
    let parent =  jq(getCurrentScript()).parent();
    jq.when(manyRequests(merchantId, productPrice, skyePlansUrl)).then( function (skyePlans: SkyePlan) {                        
        const template: string = generateWidget(merchantId, skyePlans, productPrice, noLogo, min, max, used_in, term, mode, buttonStyle, buttonText);
        
        if (Object.keys(skyePlans).length > 0)
        {            
            term? term : term = skyePlans[Object.keys(skyePlans).length - 1].PrefIntPeriod;
            widget.injectBanner(template, Config.calcInfoUrl, productPrice, merchantId, term, parent);
        } else {
            if (term)
            {
              widget.injectBanner(template, Config.calcInfoUrl, productPrice, merchantId, term, parent);
            }
        }

    })
}

function getParameterByName(name: string, url: string): string {
    name = name.replace(/[\[\]]/g, '\\$&');
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);

    if (!results) {
        return null;
    }
    if (!results[2]) {
        return '';
    }

    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function manyRequests(merchantId: string, productPrice: number, skyePlansUrl: string) {
    var promise = jq.Deferred();
    makeOneRequest(promise, merchantId, productPrice, skyePlansUrl);
    return promise;
}

function makeOneRequest(promise: any, merchantId: string, productPrice: number, skyePlansUrl: string) {
    let productPriceString = productPrice.toString();
    jq.ajax({
        method: 'GET',
        async: false,            
        url: skyePlansUrl,      
        data: 'id='+merchantId+'&amount='+productPriceString,
        dataType: "jsonp",                
        success: function (response) {              
            promise.resolve(response); 
        }
    }); 
}
