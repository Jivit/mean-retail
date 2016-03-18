
exports.userMenu = function(){
  return {
    controller: 'UserMenuController',
    templateUrl: './views/user-menu.html'
  };
};

exports.productDetails = function(){
  return {
    controller: 'ProductDetailsController',
    templateUrl: './views/product-details.html'
  };
};

exports.categoryTree = function(){
  return {
    controller: 'CategoryTreeController',
    templateUrl: './views/category-tree.html'
  };
};

exports.categoryProducts = function(){
  return {
    controller: 'CategoryProductsController',
    templateUrl: './views/category-products.html'
  };
};
