var VistaDeUnProductoEnInventario = function(opt){
    $.extend(true, this, opt);
    this.start();
};

VistaDeUnProductoEnInventario.prototype.start = function(){
    var _this = this;
    this.ui = $("#plantillas").find(".producto_en_inventario").clone();  
    this.ui.text(this.producto.nombre);
};

VistaDeUnProductoEnInventario.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};