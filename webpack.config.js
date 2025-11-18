import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';

// Resolve __dirname and __filename for ES Module environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    // Set development mode for quick compilation
    mode: 'development',

    // Define the application entry point
    entry: './src/index.jsx',

    // Define the output bundle configuration
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.[contenthash].js',
        clean: true, // Clean the output directory before emit
    },

    // Resolve extensions for imports
    resolve: {
        extensions: ['.js', '.jsx', '.json'],
    },

    // Module rules (Loaders)
    module: {
        rules: [
            // Rule 1: JavaScript/JSX (React) files
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-react']
                    }
                }
            },
            // Rule 2: CSS and PostCSS (Tailwind) files
            {
                test: /\.css$/,
                // Loaders are applied bottom-to-top/right-to-left
                use: [
                    'style-loader', // 3. Injects styles into the DOM
                    'css-loader',   // 2. Interprets @import and url()
                    'postcss-loader', // 1. Processes CSS with PostCSS/Tailwind/Autoprefixer
                ],
            }
        ]
    },

    // Plugins
    plugins: [
        new HtmlWebpackPlugin({
            template: './index.html', // Path to your HTML template
            filename: 'index.html',
        }),
    ],

    // Development Server Configuration
    devServer: {
        static: {
            directory: path.join(__dirname, 'dist'),
        },
        compress: true,
        port: 3000,
        hot: true,
        open: true, 
    },
};