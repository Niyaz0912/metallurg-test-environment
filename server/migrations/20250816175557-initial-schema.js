'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // 1. Создаем таблицу departments
      await queryInterface.createTable('departments', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        description: {
          type: Sequelize.STRING,
          allowNull: true
        }
      }, { transaction });

      // 2. Создаем таблицу users (исправленная структура)
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        username: {
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: true
        },
        firstName: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        lastName: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        role: {
          type: Sequelize.ENUM('employee', 'master', 'director', 'admin'),
          allowNull: false,
          defaultValue: 'employee'
        },
        phone: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        masterId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          onDelete: 'SET NULL'
        },
        passwordHash: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        departmentId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'departments',
            key: 'id'
          },
          onDelete: 'SET NULL'
        },
        position: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 3. Создаем таблицу production_plans
      await queryInterface.createTable('production_plans', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        customerName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        orderName: {
          type: Sequelize.STRING,
          allowNull: false
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        completedQuantity: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        progressPercent: {
          type: Sequelize.FLOAT,
          defaultValue: 0
        },
        deadline: {
          type: Sequelize.DATE,
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
          defaultValue: 'planned'
        },
        techCardId: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        priority: {
          type: Sequelize.INTEGER,
          defaultValue: 1
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 4. Создаем таблицу tech_cards
      await queryInterface.createTable('tech_cards', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        customer: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        order: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        productName: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        partNumber: {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        pdfUrl: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        pdfFileSize: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        totalProducedQuantity: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        status: {
          type: Sequelize.ENUM('draft', 'active', 'archived'),
          defaultValue: 'draft'
        },
        priority: {
          type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
          defaultValue: 'medium'
        },
        plannedEndDate: {
          type: Sequelize.DATE,
          allowNull: true
        },
        actualEndDate: {
          type: Sequelize.DATE,
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        createdById: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 5. Создаем таблицу tasks
      await queryInterface.createTable('tasks', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        status: {
          type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
          defaultValue: 'pending'
        },
        priority: {
          type: Sequelize.ENUM('low', 'medium', 'high'),
          defaultValue: 'medium'
        },
        assignedDepartmentId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'departments',
            key: 'id'
          }
        },
        assignedUserId: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        dueDate: {
          type: Sequelize.DATE,
          allowNull: true
        },
        createdById: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 6. Создаем таблицу assignments
      await queryInterface.createTable('assignments', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        operatorId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        productionPlanId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'production_plans',
            key: 'id'
          }
        },
        techCardId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'tech_cards',
            key: 'id'
          }
        },
        shiftDate: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        shiftType: {
          type: Sequelize.ENUM('day', 'night'),
          allowNull: false
        },
        taskDescription: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        machineNumber: {
          type: Sequelize.STRING,
          allowNull: false
        },
        plannedQuantity: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        actualQuantity: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        status: {
          type: Sequelize.ENUM('assigned', 'in_progress', 'completed', 'quality_check'),
          allowNull: false,
          defaultValue: 'assigned'
        },
        startedAt: {
          type: Sequelize.DATE,
          allowNull: true
        },
        completedAt: {
          type: Sequelize.DATE,
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 7. Создаем таблицу tech_card_accesses
      await queryInterface.createTable('tech_card_accesses', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        techCardId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'tech_cards',
            key: 'id'
          }
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        accessType: {
          type: Sequelize.ENUM('view', 'download', 'edit'),
          allowNull: false
        },
        accessedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 8. Создаем таблицу tech_card_executions
      await queryInterface.createTable('tech_card_executions', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        techCardId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'tech_cards',
            key: 'id'
          }
        },
        executedById: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'users',
            key: 'id'
          }
        },
        quantityProduced: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        setupNumber: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        executedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      }, { transaction });

      // 9. Добавляем внешний ключ для techCardId в production_plans
      await queryInterface.addConstraint('production_plans', {
        fields: ['techCardId'],
        type: 'foreign key',
        name: 'production_plans_techCardId_fkey',
        references: {
          table: 'tech_cards',
          field: 'id'
        },
        onDelete: 'SET NULL',
        transaction
      });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface) {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Удаляем таблицы в обратном порядке
      await queryInterface.dropTable('tech_card_executions', { transaction });
      await queryInterface.dropTable('tech_card_accesses', { transaction });
      await queryInterface.dropTable('assignments', { transaction });
      await queryInterface.dropTable('tasks', { transaction });
      await queryInterface.dropTable('tech_cards', { transaction });
      await queryInterface.dropTable('production_plans', { transaction });
      await queryInterface.dropTable('users', { transaction });
      await queryInterface.dropTable('departments', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};

