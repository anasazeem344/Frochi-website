import xml.etree.ElementTree as ET

tree = ET.parse('d:/frochi/frochi-website 2/frochi.WordPress.2026-06-18.xml')
root = tree.getroot()

namespaces = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/'
}

items = root.findall('.//item')
print(f"Total items: {len(items)}")

non_attachments = []
for item in items:
    post_type = item.find('wp:post_type', namespaces)
    if post_type is not None and post_type.text != 'attachment':
        title = item.find('title')
        title_text = title.text if title is not None else ""
        content = item.find('content:encoded', namespaces)
        content_text = content.text if content is not None else ""
        non_attachments.append((title_text, post_type.text, content_text))

print(f"Non-attachment items: {len(non_attachments)}")

for title, ptype, content in non_attachments:
    if "smoothie" in title.lower() or "smoothie" in content.lower() or "dream" in title.lower():
        print(f"Title: {title} | Type: {ptype}")
        print(f"Content snippet: {content[:300]}")
        print("-" * 50)
