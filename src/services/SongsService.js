const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const { shortenSong } = require('../utils');
const NotFoundError = require('../exceptions/NotFoundError');
const AuthorizationError = require('../exceptions/AuthorizationError');

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSong({
    title, year, performer, genre, duration, albumId, owner,
  }) {
    const id = `song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, title, year, performer, genre, duration, albumId, owner],
    };

    const result = await this._pool.query(query);

    return result.rows[0].id;
  }

  async getSongs({ title, performer }) {
    const query = {
      text: 'SELECT * FROM songs ',
      values: [],
    };

    if (title && performer) {
      query.text += "WHERE LOWER(title) LIKE '%' || LOWER($1) || '%' AND LOWER(performer) LIKE '%' || LOWER($2) || '%'";
      query.values.push(title);
      query.values.push(performer);
    } else if (title) {
      query.text += "WHERE LOWER(title) LIKE '%' || LOWER($1) || '%'";
      query.values.push(title);
    } else if (performer) {
      query.text += "WHERE LOWER(performer) LIKE '%' || LOWER($1) || '%'";
      query.values.push(performer);
    }

    const { rows } = await this._pool.query(query);
    return rows.map(shortenSong);
  }

  async getSongById(id) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu tidak ditemukan');
    }

    return result.rows[0];
  }

  async getSongsInPlaylist(songsId) {
    return (songsId.map(this.getSongById)).map(shortenSong);
  }

  async editSongById(id, {
    title, year, performer, genre, duration, albumId,
  }) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, albumId, id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui lagu, Id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Lagu gagal dihapus, Id tidak ditemukan');
    }
  }

  async verifySongOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Resource yang Anda minta tidak ditemukan');
    }

    const song = result.rows[0];

    if (song.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }
}

module.exports = SongsService;
