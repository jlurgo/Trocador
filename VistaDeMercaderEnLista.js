
var VistaDeMercaderEnLista = function(opt){
    $.extend(true, this, opt);
    this.start();
};

VistaDeMercaderEnLista.prototype.start = function(){
    var _this = this;
    this.ui = $("#plantillas").find(".mercader_en_lista").clone(); 
    this.ui.text(this.mercader.nombre);
    this.ui.click(function(){
        _this.alClickear();
    });
};

VistaDeMercaderEnLista.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};