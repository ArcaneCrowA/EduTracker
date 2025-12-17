package repository

import (
	"github.com/arcanecrowa/EduTracker/internal/models"
	"gorm.io/gorm"
)

type UserRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateUser(user *models.User) (*models.User, error) {
	result := r.db.Create(user)
	return user, result.Error
}

func (r *UserRepository) GetUser(id int) (*models.User, error) {
	var user models.User
	result := r.db.First(&user, id)
	return &user, result.Error
}

func (r *UserRepository) GetAllUsers() ([]models.User, error) {
	var users []models.User
	result := r.db.Find(&users)
	return users, result.Error
}

func (r *UserRepository) UpdateUser(user *models.User) (*models.User, error) {
	result := r.db.Save(user)
	return user, result.Error
}

func (r *UserRepository) DeleteUser(id int) error {
	result := r.db.Delete(&models.User{}, id)
	return result.Error
}

func (r *UserRepository) GetUserByLogin(login string) (*models.User, error) {
	var user models.User
	result := r.db.Where("login = ?", login).First(&user)
	return &user, result.Error
}
