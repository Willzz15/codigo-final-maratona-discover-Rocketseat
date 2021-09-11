let Modal = {
  open() {
    //Abrir modal
    //Adiciona a class active
    document
      .querySelector('.modal-overlay')
      .classList
      .add('active')
  },
  close() {
    //Fechar modal
    //Remove a class active do modal
    document
      .querySelector('.modal-overlay')
      .classList
      .remove('active')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem("dev.finances:transactions")) ||
      []
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify
      (transactions))
  }
}

//Methodos para soma de dados relacionada ao dinhero
const Transaction = {
  //Refatorar
  //Dados de cadastros das operaçoes
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0;
    // pegar todas as transacoes
    // para cada transacao,
    Transaction.all.forEach(transaction => {
      // se ela for mair que zero
      if (transaction.amount > 0) {
        // somar a uma variavel e retornar a variavel
        income = income + transaction.amount;
      }
    })
    return income;
  },

  expenses() {
    let expense = 0;
    // pegar todas as transacoes
    // para cada transacao,
    Transaction.all.forEach(transaction => {
      // se ela for menor que zero
      if (transaction.amount < 0) {
        expense = expense + transaction.amount
      }
    })
    return expense;
  },

  total() {
    return Transaction.incomes() + Transaction.expenses();
  }

}

//Cria uma linha e dentro desta linha insere os dados do transactions já alterados
const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    //Cria um elemento tr e dentro dele inseri toda a operação do innerHTMLTransaction.
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index


    //Adiciona ao html como filho da data-table
    DOM.transactionsContainer.appendChild(tr)
  },
  //Molde dos cadastros

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

    //Transforma o valor da currency para reais
    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
       <img onclick="Transaction.remove(${index})" src="assets/img/minus.svg" alt="Remover transação">
      </td>
    `
    return html

  },
  //Responsavel pelos valores dos cards

  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransaction() {
    DOM.transactionsContainer.innerHTML = ""
  }

}

//Transforma para reais
const Utils = {
  formatAmount(value) {
    value = Number(value.replace(/\,\./g, "")) * 100
    return value
  },

  formatDate(date) {
    const splittedDate = date.split("-")

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : ""
    //Substitui todos os não numeros
    value = String(value).replace(/\D/, "")

    value = Number(value) / 100

    value = value.toLocaleString("pt-BR",
      {
        style: "currency",
        currency: "BRL"
      })

    return signal + value
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()

    if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
      throw new Error("Por favor, preencha todos os campos")
    }

  },

  clearFields() {
    Form.description.value = ""
    Form.amount.value = ""
    Form.date.value = ""
  },

  submit(event) {
    event.preventDefault()

    try {
      //Verificar se todas as inforções foram preenchidas
      Form.validateFields()

      //Formatar os dados para salvar
      const transaction = Form.formatValues()
      //salvar
      Transaction.add(transaction)
      //apagar os dados do formulario
      Form.clearFields()
      //modal feche
      Modal.close()
      //Atualizar a aplicação
      //Já esta no add
    } catch (error) {
      alert(error.message)
    }

  }
}



//Atualização dos itens
const App = {
  //Refaz todo for do addtransaction, que adicona todos os transactions
  init() {
    Transaction.all.forEach(function (transaction, index) {
      DOM.addTransaction(transaction, index)
    })

    DOM.updateBalance()

    Storage.set(Transaction.all)
  },
  //Faz o reloda a limpeza da docoment e lança o init dnv para todas as transactions
  reload() {
    DOM.clearTransaction()
    App.init()
  },
}

App.init()
