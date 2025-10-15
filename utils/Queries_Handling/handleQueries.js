import productModel from "../../models/productModel.js";

export async function handleQueries(queryStr){

    const page = Number(queryStr.page) || 1;
    const limit = Number(queryStr.limit) || 4;
    const skip = (page - 1) * limit;

    let keyword = {};

    if (queryStr.keyword) {
        keyword.name = { $regex: queryStr.keyword, $options: "i" };
    }

    if (queryStr.category) {
        // keyword.category = queryStr.category;
        keyword.category = { $regex: queryStr.category, $options: "i" };;
    }

    let sortOption = {};

    if (queryStr.sortBy === "priceAsc") sortOption.price = 1;
    else if (queryStr.sortBy === "priceDesc") sortOption.price = -1;
    else if (queryStr.sortBy === "nameAsc") sortOption.name = 1;
    else if (queryStr.sortBy === "nameDesc") sortOption.name = -1;
    
    const products = await productModel
        .find(keyword)
        .sort(sortOption)
        .skip(skip)
        .limit(limit);

    const total = await productModel.countDocuments(keyword);

    return { products, total };

};