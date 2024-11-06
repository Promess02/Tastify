interface Recipe {
    recipe_id: number;
    recipe_name: string;
    ingredients: string;
    instructions: string;
    prepare_time: number;
    dish_category_id: number;
    diet_category_id: number;
    calories: number;
    image_path: string;
    num_of_portions: number;
    update_date: string;
    author_id: number;
}

export default Recipe;
