import * as jq from 'jquery';

class SkyePageInject {
    constructor(private jQuery: JQueryStatic) { }

    public injectPage(targetUrl: string, element?: any) {

        this.jQuery.ajax({
            dataType: "html",
            url: targetUrl,
            success: function (data) {
                if(element) {
                    jq(element).after(data);
                }else{
                    jq("body").append(data);
                }
            }
        });
    }
}

(($: JQueryStatic) => {
    const widget = new SkyePageInject($);
    widget.injectPage("/skye-widgets/dist/content/html/skye-landing.html", "#skye-landing-page");
})(jq);