///<reference path="../typings/jquery/jquery.d.ts"/>
///<reference path="../typings/skye.d.ts"/>
require('jquery');
//require('jquery-modal');
require('./jquery-modal');
// styles
require('../css/jquery.modal.css');
require('../css/styles-widget.css');
require('../css/styles-calc.css');
import {Config} from './config';

export class ModalInjector {
    constructor(private jQuery: JQueryStatic) {
    }

    public injectBanner(template: string, targetUrl: string, productPrice: string, merchantId: string, term: string, intRate: string, prevProductPrice: string, element?: JQuery) {

        productPrice = productPrice.toString();
        if (!this.modalExists(targetUrl, productPrice, prevProductPrice.toString())) {          
            this.injectModal(targetUrl, productPrice, merchantId, term, parseFloat(intRate));
        }

        let currentScript = document.currentScript || (function () {
            let scripts = document.getElementsByTagName('script');
            return scripts[scripts.length - 1];
        })();
        
        
        // if the element isn't passed in already
        if (!element) {      
            element = this.jQuery(currentScript);
        }

        // look for the id , if it exists then we replace the element
        // this could cause issues with multiple entries.. @todo make element id dynamic
        if (this.jQuery('.'+productPrice, element).length > 0) {
            this.jQuery('.'+productPrice, element).replaceWith(template);
        } else {  
            element.next().remove();
            //element.after(template);
            element.first().after(template);
        }

    }

    private modalExists(url: string, productPrice: string, prevProductPrice: string): boolean {
        let modalId = this.getModalId(url); //Element selector
        return this.jQuery('#' + modalId + productPrice) ? this.jQuery('#' + modalId + productPrice).length > 0 : false;
    }

    private injectModal(url: string, productPrice: string, merchantId: string, term: string, intRate: number): void {
        let modalId = this.getModalId(url);
        let termValue = term? '&terms='+term : '';
        let modalStyle = '';
        let productPriceStr = productPrice.replace('.','-');

        if (modalId == 'calc-dialog-'){
            modalStyle = 'height: 940px; max-width: 700px;';
        }        
        const bodyTag = 'body';
        const modalDiv =
            `<div id='${modalId}${productPriceStr}' class='skyeModal widget' style=\"`+modalStyle+`\">
                <div class="iframe-container">
                    <iframe src='${url}?id=${merchantId}`+termValue+`&productPrice=`+productPrice+`&int=`+intRate+`' frameborder="0" scrolling="no"></iframe>
                </div>                
            </div>`;
        const body = this.jQuery(bodyTag);
        body.append(modalDiv);
    }

    private getModalId(url: string): string {
        let modalId = '';
        if (url.indexOf('calc') > 0) {
            modalId = Config.calcInfoModalId;
        }        
        else {
            modalId = Config.priceInfoModalId;
        }
        return modalId;
    }
}
