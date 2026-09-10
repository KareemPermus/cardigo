INSERT INTO boards (title, slug) VALUES ('My First Board', 'my-first-board') ON CONFLICT (slug) DO NOTHING;

INSERT INTO columns (board_id, title, position)
SELECT b.id, 'To Do', 0 FROM boards b WHERE b.slug = 'my-first-board'
AND NOT EXISTS (SELECT 1 FROM columns c WHERE c.board_id = b.id AND c.title = 'To Do');

INSERT INTO columns (board_id, title, position)
SELECT b.id, 'In Progress', 1 FROM boards b WHERE b.slug = 'my-first-board'
AND NOT EXISTS (SELECT 1 FROM columns c WHERE c.board_id = b.id AND c.title = 'In Progress');

INSERT INTO columns (board_id, title, position)
SELECT b.id, 'Done', 2 FROM boards b WHERE b.slug = 'my-first-board'
AND NOT EXISTS (SELECT 1 FROM columns c WHERE c.board_id = b.id AND c.title = 'Done');