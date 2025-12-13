package repository

import (
	"errors"

	"github.com/arcanecrowa/EduTracker/internal/models"
)

type UserRepository struct {
	users  []models.User
	nextID int
}

func NewUserRepository() *UserRepository {
	return &UserRepository{
		users:  []models.User{},
		nextID: 1,
	}
}

func (r *UserRepository) CreateUser(user *models.User) (*models.User, error) {
	user.ID = uint(r.nextID)
	r.nextID++
	r.users = append(r.users, *user)
	return user, nil
}

func (r *UserRepository) GetUser(id int) (*models.User, error) {
	for _, user := range r.users {
		if user.ID == uint(id) {
			return &user, nil
		}
	}
	return nil, errors.New("user not found")
}

func (r *UserRepository) GetAllUsers() ([]models.User, error) {
	return r.users, nil
}

func (r *UserRepository) UpdateUser(user *models.User) (*models.User, error) {
	for i, u := range r.users {
		if u.ID == user.ID {
			r.users[i] = *user
			return user, nil
		}
	}
	return nil, errors.New("user not found")
}

func (r *UserRepository) DeleteUser(id int) error {
	for i, user := range r.users {
		if user.ID == uint(id) {
			r.users = append(r.users[:i], r.users[:i+1]...)
			return nil
		}
	}
	return errors.New("user not found")
}

func (r *UserRepository) GetUserByLogin(login string) (*models.User, error) {
	for _, user := range r.users {
		if user.Login == login {
			return &user, nil
		}
	}
	return nil, errors.New("user not found")
}
