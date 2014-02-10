
var PantallaMercado = function(opt){
    $.extend(true, this, opt);
    this.start();
};

PantallaMercado.prototype.start = function(){
    var _this = this;
    this.ui = $("#pantalla_mercado");
    this.barraDatosUsuario = this.ui.find("#panel_propio .datos_usuario");
    this.barraDatosUsuario.text(this.usuario.nombre);
    this.panelesDeInventarioDeLosMercaderes = [];
    this.selectorDeMercaderes = new SelectorDeMercaderes({
        usuario:this.usuario,
        alSeleccionarMercader: function(mercader){
            if(this.panelDelMercaderSeleccionado!==undefined) this.panelDelMercaderSeleccionado.ocultar();
            var panel = _.find(_this.panelesDeInventarioDeLosMercaderes, function(p){
                return p.mercader.nombre == mercader.nombre;
            });
            if(panel===undefined){
                panel = new PanelInventario({usuario:_this.usuario, mercader:mercader});            
                _this.panelesDeInventarioDeLosMercaderes.push(panel);            
                panel.dibujarEn(_this.ui.find("#panel_ajeno #inventario"));
            }else{
                panel.mostrar();
            }
            this.panelDelMercaderSeleccionado = panel;
        }
    });
    
    this.panelInventarioUsuario = new PanelInventario({usuario:this.usuario, mercader:this.usuario});
    this.panelInventarioUsuario.dibujarEn(this.ui.find("#panel_propio #inventario"));
    
    this.btnAgregarProducto = this.ui.find("#btn_add_producto");
    this.txt_nombre_producto_add = this.ui.find("#txt_nombre_producto_add");
    this.btnAgregarProducto.click(function(){
        vx.enviarMensaje({
            tipoDeMensaje:"trocador.agregarProducto",
            mercader: _this.usuario.nombre,
            producto: {nombre: _this.txt_nombre_producto_add.val()}
        });
    });
};                               

PantallaMercado.prototype.mostrar = function(){
     this.ui.show();
};

PantallaMercado.prototype.ocultar = function(){
    this.ui.hide();
};