# Cartful E Commerce Web Application
Cartful is an online shopping system we build for the backend development module at HAMK.  
Our main objective in this project is to demonstrate knowledge of how to use backend frameworks and build a web application simulating a real-world case.
In this project, we are using **Node.js with Express** for the server-side, **MongoDB** as the database, and **Handlebars** for page rendering.  
Moreover, we follow the **MVC structure** to keep things organized and scalable.
There are two main parts in this application: the **Customer segment** and the **Admin segment**.
The **customer part** is public-facing, where users can register, log in, browse products, add items to their cart, place orders, manage wishlists, and leave product reviews.
The **admin section** is used for internal website management. Admin users can log in securely, add or update products, manage categories, view customer orders, track performance, and generate reports.
We also make use of **RESTful APIs** for handling different operations like user authentication, cart management, product listing, and order processing. This allows clean separation of frontend and backend logic and helps with testing and future API integrations.
In addition, we plan to support multiple languages and follow accessibility principles so that the app can be used by everyone. We manage our tasks using Trello and GitHub, and follow Agile method with team collaboration.

## Carful App Features

- Customer registration and login
- Secure authentication
- Browse products by category
- Search and filter products
- Add items to cart and update cart
- Place orders and view order history
- Save items to wishlist
- Submit and read product reviews
- Multilingual support (planned)
- Accessible design with basic ARIA support
- Admin panel to manage products, orders, and reports

## Accessibility Considerations

Accessibility is a core focus of this project to ensure that the application is usable by everyone, including individuals with disabilities. Below are some of the key accessibility features implemented in this project:

1. **Semantic HTML**: Proper use of semantic HTML elements such as `<header>`, `<main>`, `<footer>`, `<nav>`, and `<section>` to improve screen reader navigation.

2. **ARIA Attributes**: Use of ARIA roles and attributes (e.g., `aria-label`, `aria-live`, `aria-expanded`) to enhance the accessibility of dynamic and interactive elements.

3. **Keyboard Navigation**: Ensured that all interactive elements are focusable and navigable using the keyboard. Added visible focus indicators for better usability.

4. **Contrast Ratios**: Updated text and background colors to meet WCAG standards for contrast ratios, ensuring readability for users with low vision.

5. **Skip Links**: Added skip links to allow users to bypass repetitive navigation and directly access the main content.

6. **Accessible Forms**: All forms include proper labels, error messages, and accessible placeholders to assist screen reader users.

7. **Responsive Design**: Ensured that the application is fully responsive and accessible on various devices and screen sizes.

8. **Testing**: Regularly tested the application using accessibility tools such as WAVE, Lighthouse, and manual screen reader testing.

For more detailed information on accessibility considerations and guidelines followed in this project, please refer to the [ACCESSIBILITY.md](./ACCESSIBILITY.md) file.

## Technologies Used

- Node.js – backend server
- Express.js – routing and middleware
- MongoDB – NoSQL database
- Mongoose – MongoDB ODM
- Handlebars – server-side page rendering
- JavaScript, HTML, CSS – core frontend
- Git + GitHub – version control
- Trello – project management


-------------

This project is developed by 3 backend developers as part of HAMK's Web Frameworks course. Each member is responsible for different parts of the backend system and follows the same coding architecture (Node.js + Express + MongoDB + Handlebars with MVC).

- **Kasun** – Responsible for **authentication**, user registration, login, OTP verification, and session handling.
- **Asitha** – Focused on **product listing and browsing**, search and filter features, and category display.
- **Mujitha** – Works on **cart management**, order placement, and all **admin panel functionalities** including reports and product management.

All members use GitHub branches, submit pull requests, and follow Agile development with daily task tracking on Trello.


## Agile Methodology & Tools

We are following Agile development and daily scrum approach. The tasks are planned and tracked using a Trello Kanban board.

- Trello Board: [Trello Link](https://trello.com/b/ru7MvStT/cartful)
- Each team member works in their own branch
- We use pull requests for merging code
- GitHub is used to manage the source code and version history