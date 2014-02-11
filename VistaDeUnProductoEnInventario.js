var VistaDeUnProductoEnInventario = function(opt){
    $.extend(true, this, opt);
    this.start();
};

VistaDeUnProductoEnInventario.prototype.start = function(){
    var _this = this;
    this.ui = $("#plantillas").find(".producto_en_inventario").clone();  
    this.ui.text(this.producto.nombre);
    this.ui.click(function(){
        if(_this.seleccionadoParaTrueque){
            _this.ui.removeClass("producto_seleccionado_para_trueque");
            _this.seleccionadoParaTrueque = false;
            _this.alDesSeleccionarParaTrueque();
        }else{
            _this.ui.addClass("producto_seleccionado_para_trueque");
            _this.seleccionadoParaTrueque = true;
            _this.alSeleccionarParaTrueque();
        }
    });
    if(_this.seleccionadoParaTrueque){
        _this.ui.addClass("producto_seleccionado_para_trueque");
    }
};

VistaDeUnProductoEnInventario.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};