# Accessibility Documentation for Cartful Project

## Overview
The Cartful project was designed with accessibility in mind to ensure that users who rely on screen readers can navigate and interact with the web content effectively. This document outlines the accessibility features implemented, the tools used for evaluation, and the responsibilities of team members in achieving accessibility compliance.

## Accessibility Features Implemented

### 1. Semantic HTML and ARIA Attributes
We used semantic HTML elements and ARIA attributes to enhance the accessibility of the user interface. Examples include:
- **`aria-labelledby`**: Used to associate form sections and headings with their respective labels, ensuring screen readers can announce them correctly.
- **`aria-label`**: Added to buttons, links, and form inputs to provide descriptive labels for screen readers.
- **`aria-live`**: Implemented for dynamic content like success/error messages to notify users of changes without requiring manual refresh.
- **`role`**: Applied to regions like `main`, `alert`, and `navigation` to define their purpose explicitly.

### 2. Keyboard Navigation
All interactive elements, such as buttons, links, and form inputs, are focusable using the `Tab` key. Focus indicators are visible, and the tab order follows a logical sequence.

### 3. Image Descriptions
All images include descriptive `alt` attributes to convey their purpose or content to screen readers. For decorative images, `aria-hidden="true"` was used to exclude them from the accessibility tree.

### 4. Dynamic Content Updates
Dynamic content, such as stock status and toast notifications, uses `aria-live` regions to announce updates to screen readers in real-time.

### 5. Error Handling
Form validation errors are announced using `aria-live` regions, ensuring users are informed of issues immediately.

### 6. Skip Links
A "Skip to Content" link was added to allow users to bypass repetitive navigation and jump directly to the main content.

### 7. Accessible Forms
Forms include:
- Descriptive labels associated with inputs using `for` attributes.
- Required fields marked with `aria-required="true"`.
- Clear error messages announced via `aria-live`.

### Examples in Practice
- **Product Details Page**: The price, discount, and stock status are announced with appropriate ARIA attributes, ensuring users can understand the product's details without visual cues.
- **Wishlist Page**: Buttons for adding/removing items from the wishlist include `aria-label` attributes to describe their actions.

## Evaluation Tools Used

### 1. Wave Browser Extension
The Wave browser extension was used to evaluate the accessibility of individual pages. It highlighted issues such as missing labels, contrast errors, and improper ARIA usage.

### 2. Axe DevTools
Axe DevTools was integrated into the browser to perform automated accessibility checks. It provided actionable insights and suggestions for improvement.

### 3. Manual Testing with NVDA
The NVDA screen reader was used to manually test the website's accessibility. This ensured that screen reader users could navigate and interact with the site effectively.

### Challenges Encountered
- **Dynamic Content**: Ensuring that dynamically updated content (e.g., toast notifications) was announced correctly required careful use of `aria-live` attributes.
- **Keyboard Navigation**: Some custom components, like dropdowns, required additional scripting to make them fully keyboard-accessible.

## Team Responsibilities
- **John Doe**: Implemented ARIA attributes and ensured semantic HTML usage across all pages.
- **Jane Smith**: Focused on keyboard navigation and dynamic content updates.
- **Alex Johnson**: Conducted manual testing with NVDA and addressed issues identified by evaluation tools.
- **Emily Davis**: Documented accessibility features and integrated feedback from testing tools.

## Recommendations for Future Work
- Conduct user testing with individuals who rely on assistive technologies to gather real-world feedback.
- Regularly update the project to comply with evolving accessibility standards.

## Notes in GitHub
A section was added to the project's `README.md` file to highlight the accessibility considerations and features implemented. This serves as a reference for future developers and contributors.

---

This document serves as a comprehensive overview of the accessibility efforts undertaken in the Cartful project. By adhering to AA 2.1 compliance standards, we aim to provide an inclusive experience for all users.