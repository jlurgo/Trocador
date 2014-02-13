Trocador = {
    start : function(){        
        vx.start({verbose:true});

        vx.conectarPorHTTP({
            url:'http://router-vortex.herokuapp.com',
            //url:'http://localhost:3000',
            intervalo_polling: 50
        });    
//        vx.conectarPorWebSockets({
//            //url:'https://router-vortex.herokuapp.com' 
//            url:'http://localhost:3000'
//        });   
        
        var _this = this;
        this.ui = $("#trocador");
        
        this.pantallaLogin = $("#pantalla_login");
        this.divNombreUsuario = this.pantallaLogin.find("#nombre_usuario");
        this.divBotonIngresar = this.pantallaLogin.find("#boton_ingresar");
        this.divBotonIngresar.click(function(){
            var nombre_usuario = _this.divNombreUsuario.val();
            _this.pantallaLogin.hide();
            _this.usuario = {
                nombre: nombre_usuario,
                inventario: []
            };
            _this.alIngresarAlMercado();
        });
    },
    
    alIngresarAlMercado:function(){
        var _this = this;
        this.setupVortex();
        
        this.mercaderes = [];
        this.maxIdDeProductoGenerado = 0;
        this.mercaderSeleccionado = {nombre:"", inventario:[], trueque: {mio:[], suyo:[]}};
        
        this.panelInventarioUsuario = this.ui.find("#panel_propio .panel_inventario");        
        this.panelInventarioDelOtro = this.ui.find("#panel_ajeno .panel_inventario");
        
        this.pantalla_mercado =  $("#pantalla_mercado");
        this.barraDatosUsuario = this.pantalla_mercado.find("#panel_propio .datos_usuario");
        this.barraDatosUsuario.text(this.usuario.nombre);

        SelectorDeMercaderes.start({
            mercaderes: this.mercaderes,
            alSeleccionarMercader: function(mercader){           
                _this.mercaderSeleccionado = mercader;
                _this.dibujarInventarios();
            }
        });

        this.btnAgregarProducto = this.pantalla_mercado.find("#btn_add_producto");
        this.txt_nombre_producto_add = this.pantalla_mercado.find("#txt_nombre_producto_add");
        this.btnAgregarProducto.click(function(){
            _this.agregarProductoAMiInventario({nombre:_this.txt_nombre_producto_add.val()});
            _this.txt_nombre_producto_add.val("");
        });
    
        
        this.btnProponerTrueque = this.pantalla_mercado.find("#btnProponerTrueque");
        this.btnProponerTrueque.click(function(){
            vx.enviarMensaje({
                tipoDeMensaje:"trocador.propuestaDeTrueque",
                para: _this.mercaderSeleccionado.nombre,
                de: _this.usuario.nombre,
                pido: _this.mercaderSeleccionado.trueque.suyo,
                doy: _this.mercaderSeleccionado.trueque.mio
            });
            _this.mercaderSeleccionado.trueque.envioPropuesta = "yo";
            _this.dibujarInventarios();
        });
        
        this.btnAceptarTrueque = this.pantalla_mercado.find("#btnAceptarTrueque");
        this.btnAceptarTrueque.click(function(){
            vx.enviarMensaje({
                tipoDeMensaje:"trocador.aceptacionDeTrueque",
                para: _this.mercaderSeleccionado.nombre,
                de: _this.usuario.nombre,
                pido: _this.mercaderSeleccionado.trueque.suyo,
                doy: _this.mercaderSeleccionado.trueque.mio
            });
            _this.concretarTruequeCon(_this.mercaderSeleccionado);
            _this.dibujarInventarios();
        });
        
        this.btnRefrescarMercaderes = this.pantalla_mercado.find("#btn_refrescar");
        this.btnRefrescarMercaderes.click(function(){
            vx.enviarMensaje({
                tipoDeMensaje: "trocador.avisoDeIngreso",
                de: _this.usuario.nombre,
                inventario:_this.usuario.inventario
            });     
        });
        
        this.dibujarInventarios();
        this.pantalla_mercado.show();
        
        vx.enviarMensaje({
            tipoDeMensaje: "trocador.avisoDeIngreso",
            de: this.usuario.nombre,
            inventario:this.usuario.inventario
        });
    },
    setupVortex: function(){
        var _this = this;
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDeIngreso"
            }),
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.nombre) return;
                _this.agregarMercader(mensaje.de, mensaje.inventario);
                vx.enviarMensaje({
                    tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                    de: _this.usuario.nombre,
                    para: mensaje.de,
                    inventario: _this.usuario.inventario
                });
            }
        });  

        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje: "trocador.respuestaAAvisoDeIngreso",
                para: this.usuario.nombre
            }),
            callback: function(mensaje){
                _this.agregarMercader(mensaje.de, mensaje.inventario);
            }
        });
        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDeNuevoProducto"
            }),
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.nombre) return;
                var mercader = _.findWhere(_this.mercaderes, {nombre: mensaje.de});
                _this.agregarProductoAlInventarioDe(mensaje.producto, mercader);
            }
        });  
        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.avisoDeBajaDeProducto"
            }),
            callback: function(mensaje){
                if(mensaje.de == _this.usuario.nombre) return;
                var mercader = _.findWhere(_this.mercaderes, {nombre: mensaje.de});
                _this.quitarProductoDelInventarioDe(mensaje.producto, mercader);
            }
        });  
        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.propuestaDeTrueque",
                para: this.usuario.nombre
            }),
            callback: function(mensaje){
                var mercader = _.findWhere(_this.mercaderes, {nombre: mensaje.de});
                mercader.trueque.mio = mensaje.pido;
                mercader.trueque.suyo = mensaje.doy;            
                mercader.trueque.envioPropuesta = "el";                
                _this.dibujarInventarios();
            }
        });  
        
        vx.pedirMensajes({
            filtro: new FiltroXEjemplo({
                tipoDeMensaje:"trocador.aceptacionDeTrueque",
                para: this.usuario.nombre
            }),
            callback: function(mensaje){
                var mercader = _.findWhere(_this.mercaderes, {nombre: mensaje.de});
                _this.concretarTruequeCon(mercader);
                _this.dibujarInventarios();
            }
        });    
    },
    agregarMercader: function(nombre, inventario){
        var mercader = _.findWhere(this.mercaderes, {nombre:nombre});
        if( mercader !== undefined) {
            mercader.inventario = inventario;
            this.dibujarInventarios();
            return;
        }
        this.mercaderes.push({
            nombre: nombre,
            inventario:inventario||[],
            trueque: {
                suyo: [],
                mio: [],
                envioPropuesta: "ninguno"
            }
        });
        SelectorDeMercaderes.actualizar();
    },
    agregarProductoAlInventarioDe: function(producto, mercader){
        if(_.findWhere(mercader.inventario, {id: producto.id})!== undefined) return;
        mercader.inventario.push(producto);
        this.dibujarInventarios();
    },
    agregarProductoAMiInventario: function(producto){
        producto.id = this.maxIdDeProductoGenerado; //_.max(this.usuario.inventario, function(p){return p.id;}) + 1;
        this.maxIdDeProductoGenerado+=1;
        this.agregarProductoAlInventarioDe(producto, this.usuario);
        vx.enviarMensaje({
            tipoDeMensaje:"trocador.avisoDeNuevoProducto",
            de: this.usuario.nombre,
            producto: producto
        });
    },
    quitarProductoDelInventarioDe: function(producto, mercader){
        mercader.inventario = $.grep(mercader.inventario, function(prod){
            return producto.id != prod.id;
        });
        this.dibujarInventarios();
    },
    quitarProductoDeMiInventario: function(producto){
        this.quitarProductoDelInventarioDe(producto, this.usuario)
        vx.enviarMensaje({
            tipoDeMensaje:"trocador.avisoDeBajaDeProducto",
            de: this.usuario.nombre,
            producto: producto
        });
    },
    concretarTruequeCon: function(mercader){
        var _this = this;
        _.each(mercader.trueque.mio, function(pt){
            _this.quitarProductoDeMiInventario(pt);
        });
        _.each(mercader.trueque.suyo, function(pt){
            _this.quitarProductoDelInventarioDe(pt, mercader);
            _this.agregarProductoAMiInventario(pt);            
        });
        mercader.trueque.mio.length = 0;
        mercader.trueque.suyo.length = 0;   
        mercader.trueque.envioPropuesta = "ninguno";
    },
    dibujarInventarios: function(){
        this.panelInventarioUsuario.empty();
        this.panelInventarioDelOtro.empty()
        var _this = this;
        _.each(this.usuario.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto, 
                seleccionadoParaTrueque: (_.findWhere(_this.mercaderSeleccionado.trueque.mio, {id: producto.id})!== undefined),
                alSeleccionarParaTrueque: function(){
                    _this.mercaderSeleccionado.trueque.mio.push(producto);
                    _this.btnProponerTrueque.show();            
                    _this.btnAceptarTrueque.hide();   
                },
                alDesSeleccionarParaTrueque: function(){
                    _.each(_this.mercaderSeleccionado.trueque.mio, function(p, i){
                        if(producto.id == p.id) _this.mercaderSeleccionado.trueque.mio.splice(i, 1);
                    });
                    _this.btnProponerTrueque.show();            
                    _this.btnAceptarTrueque.hide();  
                }
            });
            vista.dibujarEn(_this.panelInventarioUsuario);
        });
        
        _.each(this.mercaderSeleccionado.inventario, function(producto){
            var vista = new VistaDeUnProductoEnInventario({
                producto: producto, 
                seleccionadoParaTrueque: (_.findWhere(_this.mercaderSeleccionado.trueque.suyo, {id: producto.id})!== undefined),
                alSeleccionarParaTrueque: function(){
                    _this.mercaderSeleccionado.trueque.suyo.push(producto);
                    _this.btnProponerTrueque.show();            
                    _this.btnAceptarTrueque.hide();   
                },
                alDesSeleccionarParaTrueque: function(){
                    _.each(_this.mercaderSeleccionado.trueque.suyo, function(p, i){
                        if(producto.id == p.id) _this.mercaderSeleccionado.trueque.suyo.splice(i, 1);
                    });
                    _this.btnProponerTrueque.show();            
                    _this.btnAceptarTrueque.hide();  
                }
            });
            vista.dibujarEn(_this.panelInventarioDelOtro);
        });
        
        if(this.mercaderSeleccionado.trueque.envioPropuesta == "el") {this.btnProponerTrueque.hide();
                                             this.btnAceptarTrueque.show();}
        if(this.mercaderSeleccionado.trueque.envioPropuesta == "ninguno") {this.btnProponerTrueque.show();
                                             this.btnAceptarTrueque.hide();}
        if(this.mercaderSeleccionado.trueque.envioPropuesta == "yo") {this.btnProponerTrueque.hide();
                                             this.btnAceptarTrueque.hide();}
    }
    
};