var PanelInventario = function(opt){
    $.extend(true, this, opt);
    this.start();
};

PanelInventario.prototype.start = function(){
    var _this = this;
    this.productosEnTrueque = [];
    this.mercader = {nombre:"", inventario:[]};
    this.ui = $("#plantillas").find(".panel_inventario").clone(); 
};

PanelInventario.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};

PanelInventario.prototype.actualizar = function(){
    var _this = this;
    this.ui.empty();
    _.each(this.mercader.inventario, function(producto){
        var vista = new VistaDeUnProductoEnInventario({
            producto: producto, 
            seleccionadoParaTrueque: (_.findWhere(_this.productosEnTrueque, {id: producto.id})!== undefined),
            alSeleccionarParaTrueque: function(){
                _this.productosEnTrueque.push(producto);
                _this.alCambiarLosProductosDelTrueque();
            },
            alDesSeleccionarParaTrueque: function(){
                _.each(_this.productosEnTrueque, function(p, i){
                    if(producto.id == p.id) _this.productosEnTrueque.splice(i, 1);
                });
                _this.alCambiarLosProductosDelTrueque();
            }
        });
        vista.dibujarEn(_this.ui);
    }) 
};

PanelInventario.prototype.setMercader = function(mercader){
    this.mercader = mercader;
    this.actualizar();
};

PanelInventario.prototype.setItemsTrueque = function(productos){
    this.productosEnTrueque = productos;
    this.actualizar();
};