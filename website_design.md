<website_design>
MustMe is a modern product review social network app with a warm, contemporary design aesthetic. The interface features a sophisticated sidebar navigation paired with a bright, engaging main content area. The color palette centers around vibrant orange tones that create energy and warmth, balanced with clean whites and subtle grays for excellent readability.

The layout uses a fixed sidebar on the left containing navigation items (Home, Search, Post, Ranking, Profile) with clean icons and typography. The main content area displays a comprehensive home feed featuring product reviews with images, ratings, comments, and social interactions (likes, bookmarks). 

Key sections include:
1. A search interface with category tags and trending/recent search history
2. Product cards displaying high-quality images, prices, ratings, and review counts
3. Social interaction elements integrated seamlessly throughout
4. A clean, modern typography system that emphasizes readability
5. Strategic use of orange accents for primary actions and branding

The design successfully balances functionality with visual appeal, creating an interface that feels both professional and approachable for product review sharing and discovery.
</website_design>

<high_level_design>
1. Color Palette:
   - Primary: Orange (#ea580c) - Used for primary actions, brand elements, and key interactive components
   - Neutral: Gray scale from white (#ffffff) to dark gray (#1f2937) for text, backgrounds, and structural elements
   - Usage: Orange for CTAs, active states, and brand identity; grays for content hierarchy and interface structure

2. Typography:
   - Font Family: Inter - A modern, highly legible sans-serif font perfect for both interface text and content reading
   - Provides excellent readability across all device sizes and maintains professional appearance
</high_level_design>

<components>
<create_component>
<file_path>src/components/mustme/sidebar-navigation.tsx</file_path>
<design_instructions>
Create a fixed sidebar navigation component with the MustMe branding and main navigation items. The sidebar should be approximately 280px wide with a clean white background and subtle border on the right.

Header section:
- "MustMe" logo/title in orange (#ea580c) using a bold weight, positioned at the top with proper padding
- Clean, modern typography treatment

Navigation menu items (vertical stack with proper spacing):
- Home (house icon) - with Japanese text "ホーム"
- Search (search icon) - with Japanese text "検索"  
- Post (plus icon) - with Japanese text "投稿"
- Ranking (trending up icon) - with Japanese text "ランキング"
- Profile (user icon) - with Japanese text "プロフィール"

Each navigation item should:
- Use gray-600 text color by default
- Have hover states that show orange background with white text
- Include proper icon spacing and padding
- Use clean, readable typography
- Have active states for current page indication

Bottom section:
- Simple user avatar circle with placeholder initial
- Clean separation from main navigation

Overall styling should be minimal, clean, and professional with proper white space and subtle visual hierarchy.
</design_instructions>
</create_component>

<create_component>
<file_path>src/components/mustme/search-header.tsx</file_path>
<design_instructions>
Create a search header component that sits at the top of the main content area. This should include:

Search bar:
- Full-width search input with placeholder text "商品名で検索..."
- Search icon on the left side of the input
- Clean, rounded border styling
- Light background color
- Proper padding and typography

Category tags section below search:
- Horizontal scrollable row of category pills/badges
- Categories include: "すべて", "美容・コスメ", "ガジェット・家電", "ファッション・グルメ・その他", "ゲーム・生活", "スポーツ・アウトドア"
- Orange background for active category, light gray for inactive
- Rounded pill styling with proper padding
- Smooth hover effects

Right side controls:
- "人気順" dropdown selector with down arrow
- Grid/list view toggle icons (grid and list icons)
- Orange color for active/selected states

The component should use proper spacing, clean typography, and maintain the orange/gray color scheme. Include subtle shadows or borders for depth and modern feel.
</design_instructions>
</create_component>

<create_component>
<file_path>src/components/mustme/trending-searches.tsx</file_path>
<design_instructions>
Create a trending searches component that displays popular and recent search terms. This should include:

Popular searches section:
- "人気の検索" heading with trending icon
- Grid of popular search tags including: "iPhone 15 Pro", "Nintendo Switch", "AirPods Pro", "MacBook Air", "SK-II 化粧水", "デロンギ エスプレッソマシン", "ユニクロ ダウンジャケット", "バルミューダ トースター", "Apple Watch", "ダイソン ドライヤー"
- Tags styled as rounded pills/badges with light gray background
- Hover effects with orange accent
- Proper spacing in responsive grid layout

Recent searches section:
- "最近の検索" heading with clock icon  
- Recent search tags: "AirPods Pro", "iPhone 15 Pro", "Nintendo Switch"
- Similar styling to popular searches but with distinct visual hierarchy
- Slightly smaller text/badges

Both sections should use clean typography, proper spacing, and maintain visual consistency with the overall design. Include subtle hover interactions and responsive behavior.
</design_instructions>
</create_component>

<create_component>
<file_path>src/components/mustme/product-card.tsx</file_path>
<design_instructions>
Create a product review card component that displays product information with social features. Each card should include:

Card structure:
- Clean white background with subtle shadow/border
- Rounded corners for modern feel
- Proper padding and spacing throughout

Product image:
- Large, high-quality product image at top
- Rounded corners
- Aspect ratio maintained for consistency

Product information:
- Product name in bold, readable typography
- Price in larger, prominent text with proper currency formatting (¥159,800)
- Star rating display (5 stars with filled/unfilled states)
- Review count in parentheses, e.g., "(1248)"

Visual elements:
- Clean separation between elements
- Proper typography hierarchy
- Consistent spacing and alignment
- Orange color for primary elements like prices or ratings
- Gray text for secondary information

Hover states:
- Subtle elevation increase on hover
- Smooth transitions for professional feel

The card should be flexible to accommodate different product types while maintaining visual consistency. Use the established orange/gray color scheme and Inter typography.
</design_instructions>
</create_component>

<create_component>
<file_path>src/components/mustme/main-content-layout.tsx</file_path>
<design_instructions>
Create the main content layout component that combines the search header, trending searches, and product grid. This should include:

Layout structure:
- Full-height container that works with the sidebar
- Proper padding and margins for content spacing
- Clean background (light gray or white)

Content sections:
- Search header component at the top
- Trending searches section below header
- Product grid area for displaying product cards
- Responsive grid layout (3-4 cards per row on desktop, fewer on mobile)
- Proper gap spacing between cards

Grid system:
- CSS Grid or flexbox for responsive product card layout
- Consistent spacing and alignment
- Cards should maintain consistent heights
- Smooth responsive behavior across screen sizes

Overall styling:
- Clean, modern appearance
- Proper content hierarchy with spacing
- Seamless integration with sidebar navigation
- Professional, app-like interface feeling

The layout should feel spacious but efficient, with excellent readability and visual flow that guides users through the product discovery experience.
</design_instructions>
</create_component>
</components>