// test/api.test.js

import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../app.js';  // Assicurati che 'app.js' esporti correttamente l'app

chai.use(chaiHttp);
const { expect } = chai;

describe('API Tests', () => {
  let userId;
  let goalId;

  before((done) => {
    // Creiamo un utente di test
    chai.request(app)
      .post('/api/users')
      .send({
        nome: 'Mario Rossi',
        email: 'mario@example.com',
        password: 'password',
        ruolo: 'user'
      })
      .end((err, res) => {
        if (err) {
          console.error('Error creating test user:', err);
          return done(err);
        }
        console.log('Test user created:', res.body);
        userId = res.body.id;
        done();
      });
  });

  describe('User Routes', () => {
    it('should return 200 for the base route', (done) => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          if (err) {
            console.error('Error in base route test:', err);
            return done(err);
          }
          console.log('Base route response:', res.body);
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should add a new user', (done) => {
      chai.request(app)
        .post('/api/users')
        .send({
          nome: 'Mario Rossi',
          email: 'mario@example.com',
          password: 'password',
          ruolo: 'user'
        })
        .end((err, res) => {
          if (err) {
            console.error('Error adding user:', err);
            return done(err);
          }
          console.log('User added:', res.body);
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('id');
          userId = res.body.id;
          done();
        });
    });

    it('should get all users', (done) => {
      chai.request(app)
        .get('/api/users')
        .end((err, res) => {
          if (err) {
            console.error('Error getting all users:', err);
            return done(err);
          }
          console.log('All users response:', res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });

    it('should get a user by ID', (done) => {
      chai.request(app)
        .get(`/api/users/${userId}`)
        .end((err, res) => {
          if (err) {
            console.error('Error getting user by ID:', err);
            return done(err);
          }
          console.log('User by ID response:', res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id').eql(userId);
          done();
        });
    });

    it('should update a user', (done) => {
      chai.request(app)
        .put(`/api/users/${userId}`)
        .send({ nome: 'Mario Rossi Updated', email: 'marioupdated@example.com', password: 'newpassword', ruolo: 'admin' })
        .end((err, res) => {
          if (err) {
            console.error('Error updating user:', err);
            return done(err);
          }
          console.log('User updated:', res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id').eql(userId);
          done();
        });
    });

    it('should delete a user', (done) => {
      chai.request(app)
        .delete(`/api/users/${userId}`)
        .end((err, res) => {
          if (err) {
            console.error('Error deleting user:', err);
            return done(err);
          }
          console.log('User deleted');
          expect(res).to.have.status(204);
          done();
        });
    });
  });

  describe('Goal Routes', () => {
    it('should add a new goal', (done) => {
      chai.request(app)
        .post('/api/goals')
        .send({
          user_id: userId,
          nome_obiettivo: 'New Goal',
          descrizione: 'Test goal description'
        })
        .end((err, res) => {
          if (err) {
            console.error('Error adding goal:', err);
            return done(err);
          }
          console.log('Goal added:', res.body);
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('id');
          goalId = res.body.id;
          done();
        });
    });

    it('should get all goals for a user', (done) => {
      chai.request(app)
        .get(`/api/goals/${userId}`)
        .end((err, res) => {
          if (err) {
            console.error('Error getting all goals for user:', err);
            return done(err);
          }
          console.log('All goals for user response:', res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });

    it('should get a goal by ID', (done) => {
      chai.request(app)
        .get(`/api/goals/${goalId}`)
        .end((err, res) => {
          if (err) {
            console.error('Error getting goal by ID:', err);
            return done(err);
          }
          console.log('Goal by ID response:', res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id').eql(goalId);
          done();
        });
    });

    it('should update a goal', (done) => {
      chai.request(app)
        .put(`/api/goals/${goalId}`)
        .send({ nome_obiettivo: 'Updated Goal', descrizione: 'Updated goal description', stato: 'completato' })
        .end((err, res) => {
          if (err) {
            console.error('Error updating goal:', err);
            return done(err);
          }
          console.log('Goal updated:', res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id').eql(goalId);
          done();
        });
    });

    it('should delete a goal', (done) => {
      chai.request(app)
        .delete(`/api/goals/${goalId}`)
        .end((err, res) => {
          if (err) {
            console.error('Error deleting goal:', err);
            return done(err);
          }
          console.log('Goal deleted');
          expect(res).to.have.status(204);
          done();
        });
    });
  });

  after((done) => {
    // Elimina l'utente di test
    chai.request(app)
      .delete(`/api/users/${userId}`)
      .end((err, res) => {
        if (err) {
          console.error('Error deleting test user:', err);
          return done(err);
        }
        console.log('Test user deleted');
        done();
      });
  });
});
