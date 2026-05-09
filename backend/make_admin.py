import sqlite3

conn = sqlite3.connect('lunart.db')
c = conn.cursor()
c.execute("UPDATE users SET role='admin' WHERE full_name LIKE '%joao vitor%' OR full_name LIKE '%João Vitor%'")
conn.commit()
conn.close()
print('Joao Vitor is admin!')
