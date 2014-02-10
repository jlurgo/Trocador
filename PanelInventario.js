var PanelInventario = function(opt){
    $.extend(true, this, opt);
    this.start();
};

PanelInventario.prototype.start = function(){
    var _this = this;
    this.ui = $("#plantillas").find(".panel_inventario").clone(); 
    vx.pedirMensajes({
        filtro: new FiltroXEjemplo({
            tipoDeMensaje: "trocador.inventario",
            mercader: this.mercader.nombre,
            para: this.usuario.nombre
        }),
        callback: function(mensaje){
            _.each(mensaje.inventario, function(producto){
                _this.agregarProducto(producto);
            });            
        }
    });  
    
    vx.pedirMensajes({
        filtro: new FiltroXEjemplo({
            tipoDeMensaje: "trocador.nuevoProducto",
            mercader: this.mercader.nombre
        }),
        callback: function(mensaje){
            _this.agregarProducto(mensaje.producto);           
        }
    });  
    
    vx.enviarMensaje({
        tipoDeMensaje:"trocador.pedidoDeInventario",
        mercader:this.mercader.nombre,
        pide: this.usuario.nombre
    });
};

PanelInventario.prototype.agregarProducto = function(un_producto){
    var vista = new VistaDeUnProductoEnInventario({producto:un_producto});
    vista.dibujarEn(this.ui);
};

PanelInventario.prototype.dibujarEn = function(un_panel){
    un_panel.append(this.ui);  
};

PanelInventario.prototype.mostrar = function(){
     this.ui.show();
};

PanelInventario.prototype.ocultar = function(){
    this.ui.hide();
};