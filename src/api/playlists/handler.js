const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, songsService, usersService, validator) {
    this._playlistsService = playlistsService;
    this._usersService = usersService;
    this._songsService = songsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePostPlaylistPayload(request.payload);

    const { name } = request.payload;
    const { userId } = request.auth.credentials;

    const playlistId = await this._playlistsService.addPlaylist({ name, owner: userId });

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler(request) {
    const { userId } = request.auth.credentials;
    const playlists = await this._playlistsService.getPlaylists(userId);
    const { username } = await this._usersService.getUserById(userId);

    return {
      status: 'success',
      data: {
        playlists: {
          ...playlists,
          username,
        },
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    await this._playlistsService.deletePlaylistById(playlistId, userId);
    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    };
  }

  async postSongInPlaylistHandler(request, h) {
    this._validator.validatePostSongInPlaylistPayload(request.payload);

    const { id: playlistId } = request.params;
    const { songId } = request.payload;
    const { userId } = request.auth.credentials;

    await this._songsService.verifySongOwner(songId, userId);
    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);

    await this._playlistsService.addSongInPlaylist(playlistId, songId);

    const response = h.response({
      status: 'success',
      message: 'Lagu berhasil ditambahkan pada playlist',
    });
    response.code(201);
    return response;
  }

  async getSongsInPlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    const playlist = await this._playlistsService.getPlaylistById(playlistId);
    const { username } = await this._usersService.getUserById(userId);

    const songsId = await this._playlistsService.getSongsIdInPlaylist(playlistId);
    const songs = await this._songsService.getSongsInPlaylist(songsId);

    return {
      status: 'success',
      data: {
        playlist: {
          ...playlist,
          username,
          songs,
        },
      },
    };
  }

  async deleteSongInPlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const { userId } = request.auth.credentials;
    const { songId } = request.payload;

    await this._playlistsService.verifyPlaylistOwner(playlistId, userId);
    await this._playlistsService.deleteSongInPlaylist(songId);

    return {
      status: 'success',
      message: 'Lagu berhasil dihapus',
    };
  }
}

module.exports = PlaylistsHandler;
