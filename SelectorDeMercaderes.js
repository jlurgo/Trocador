var SelectorDeMercaderes = function(opt){
    $.extend(true, this, opt);
    this.start();
};

SelectorDeMercaderes.prototype.start = function(){
    var _this = this;
    this.ui = $("#selector_mercaderes");
    this.mercaderesEnElMercado = [];
    this.leyenda_cuando_no_hay_seleccionado = this.ui.find("#leyenda_cuando_no_hay_seleccionado");
    this.leyenda_cuando_no_hay_mercaderes = this.ui.find("#leyenda_cuando_no_hay_mercaderes");
    this.divListaMercaderes = this.ui.find("#lista_mercaderes");
    this.divMercaderSeleccionado = this.ui.find("#mercader_seleccionado");
    
    this.divMercaderSeleccionado.hide();
    this.divListaMercaderes.hide();
    this.leyenda_cuando_no_hay_seleccionado.hide();
    
    this.leyenda_cuando_no_hay_mercaderes.click(function(){
        vx.enviarMensaje({
            tipoDeMensaje:"trocador.pedidoDeIntegrantesDelMercado",
            pide:_this.usuario.nombre
        });
    });
    
    this.leyenda_cuando_no_hay_seleccionado.click(function(){
        _this.divListaMercaderes.show();
    });
    
    this.divMercaderSeleccionado.click(function(){
        _this.divListaMercaderes.show();
        vx.enviarMensaje({
            tipoDeMensaje:"trocador.pedidoDeIntegrantesDelMercado",
            pide:_this.usuario.nombre
        });
    });
    
    vx.pedirMensajes({
        filtro: new FiltroOR([
            new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDePresenciaEnElMercado",
                para:this.usuario.nombre
            }),
            new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDeIngresoAlMercado"
            })]
        ),
        callback: function(mensaje){
            if(_this.tengoAlMercader(mensaje.nombre_mercader))return;
            var mercader = {nombre: mensaje.nombre_mercader};
            _this.agregarMercader(mercader);
        }
    });  
        
    vx.enviarMensaje({
        tipoDeMensaje:"trocador.pedidoDeIntegrantesDelMercado",
        pide:this.usuario.nombre
    });
};                               

SelectorDeMercaderes.prototype.agregarMercader = function(mercader){
    var _this = this;
    this.mercaderesEnElMercado.push(mercader);
    var vista = new VistaDeMercaderEnLista({mercader:mercader,
                                           alClickear: function(){
                                               _this.seleccionarMercader(mercader);
                                           }}); 
    vista.dibujarEn(this.divListaMercaderes);
    this.leyenda_cuando_no_hay_mercaderes.hide();
    if(this.mercaderSeleccionado=== undefined) this.leyenda_cuando_no_hay_seleccionado.show();
};

SelectorDeMercaderes.prototype.seleccionarMercader = function(mercader){
    this.divMercaderSeleccionado.show();
    this.divMercaderSeleccionado.text(mercader.nombre);
    this.divListaMercaderes.hide();
    this.leyenda_cuando_no_hay_seleccionado.hide();
    this.alSeleccionarMercader(mercader);
};

SelectorDeMercaderes.prototype.tengoAlMercader = function(nombre_mercader){
    if(nombre_mercader == this.usuario.nombre) return true;
    return _.find(this.mercaderesEnElMercado, function(mercader){
        return mercader.nombre == nombre_mercader;
    })!==undefined;
};