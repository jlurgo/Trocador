var PantallaLogin = function(opt){
    $.extend(true, this, opt);
    this.start();
}

PantallaLogin.prototype.start = function(){
    var _this = this;
    this.ui = $("#pantalla_login");
    this.divNombreUsuario = this.ui.find("#nombre_usuario");
    this.divBotonIngresar = this.ui.find("#boton_ingresar");
    this.divBotonIngresar.click(function(){
        var nombre_usuario = _this.divNombreUsuario.val();
        _this.alIngresarUsuario(nombre_usuario);
        _this.ui.hide();
    });
};