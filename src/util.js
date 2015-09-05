bind = function(callerObj, method) {
    var f = function() {
        return method.apply(callerObj, arguments);
    };
    return f;
};

