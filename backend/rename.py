import sqlite3

conn = sqlite3.connect('lunart.db')
c = conn.cursor()
c.execute("UPDATE products SET name = 'Template ' || id, image_url = NULL;")
conn.commit()
conn.close()
print('Updated products using sqlite3 directly!')
