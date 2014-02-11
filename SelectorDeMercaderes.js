SelectorDeMercaderes = {
    start: function(opt){
        this.mercaderes = opt.mercaderes;
        this.alSeleccionarMercader = opt.alSeleccionarMercader;
        
        var _this = this;
        this.ui = $("#selector_mercaderes");
        this.leyenda_cuando_no_hay_seleccionado = this.ui.find("#leyenda_cuando_no_hay_seleccionado");
        this.leyenda_cuando_no_hay_mercaderes = this.ui.find("#leyenda_cuando_no_hay_mercaderes");
        this.divListaMercaderes = this.ui.find("#lista_mercaderes");
        this.divMercaderSeleccionado = this.ui.find("#mercader_seleccionado");

        this.divMercaderSeleccionado.hide();
        this.divListaMercaderes.hide();
        this.leyenda_cuando_no_hay_seleccionado.hide();

        this.leyenda_cuando_no_hay_seleccionado.click(function(){
            _this.divListaMercaderes.show();
        });

        this.divMercaderSeleccionado.click(function(){
            _this.divListaMercaderes.show();
        });
        this.actualizar();
    },
    agregarVistaMercader : function(mercader){
        var _this = this;
        var vista = new VistaDeMercaderEnLista({mercader:mercader,
                                               alClickear: function(){
                                                   _this.seleccionarMercader(mercader);
                                               }}); 
        vista.dibujarEn(this.divListaMercaderes);
        this.leyenda_cuando_no_hay_mercaderes.hide();
    },
    seleccionarMercader : function(mercader){
        this.divMercaderSeleccionado.show();
        this.divMercaderSeleccionado.text(mercader.nombre);
        this.divListaMercaderes.hide();
        this.leyenda_cuando_no_hay_seleccionado.hide();
        this.mercaderSeleccionado = mercader;
        this.alSeleccionarMercader(mercader);
    },
    actualizar : function(){
        var _this = this;
        this.divListaMercaderes.empty();
        if(this.mercaderes.length>0){
            _.each(this.mercaderes, function(mercader){
                _this.agregarVistaMercader(mercader);
            });
            if(this.mercaderSeleccionado===undefined){
                _this.leyenda_cuando_no_hay_seleccionado.show();
            }
        }
    }
};

