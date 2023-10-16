import map from "lodash/map";
import toLower from "lodash/toLower";

export const getCategoriesHelper = (categories, result = []) => {
	if(Array.isArray(categories)){
		for (let category of categories) {
			if (result.length === 5) {
				break;
			}
			if (Array.isArray(category)) {
				getCategoriesHelper(category, result);
			} else {
				result.push({name: category.name});
			}
		}
	}
	return result;
}

export const formatProduct = (product) => {
	const categories = getCategoriesHelper(product?.categories);

	const formatedProduct = {
		...product,
		categories: categories,
	};

	return formatedProduct
}

export const formatCart = (cart) => {
	const updatedItems = map(cart?.items,(item) => ({
		...item,
		store: {
			name: toLower(item?.store?.name) != "ks" ? item?.store?.name : ""
		},
		product: formatProduct(item?.product),
	}));

	return {
		...cart,
		items: updatedItems,
	};
};

export const formatItem = (item) => {
	const updatedItem = {
		...item,
		product: formatProduct(item?.product),
	};

	return updatedItem;
};

export const formatOrder = (order) => {
	const updatedItems = map(order?.orderItems,(item) => ({
		...item,
		size: "",
		product: formatProduct(item?.product),
	}));

	return {
		...order,
		orderItems: updatedItems,
	};
};

export const formatedVariant = (name) => {
	if(name){
		if(toLower(name) == "ks"){
			return ""
		}
		return name
	}
	return "";
}
