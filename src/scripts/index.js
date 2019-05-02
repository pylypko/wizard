/* jshint esversion:6 */
import '../styles/index.scss';

import $ from 'jquery';
import 'popper.js';
import 'bootstrap';


let buildTabs = function(data){
  let formContainer = document.getElementById('form-container'),
      tabListHTML = '<ul class="nav nav-tabs" id="myTab" role="tablist">',
      tabPaneHTML = '<div class="tab-content">';

  data.forEach(function(item, index){
    let tabId = 'ipTab'+(item.title.split(' ')[0]),
        activeTab = !index ? "active" : "disabled";

    tabListHTML += '<li class="nav-item"><a class="nav-link '+ activeTab +'" data-toggle="tab" href="#'+tabId+'" role="tab" data-index="'+index+'">'+item.title+'</a></li>';
    tabPaneHTML += '<div class="tab-pane pt-3 '+ activeTab +'" id="'+tabId+'">'+item.description+'</div>';
  });
  
  tabListHTML += '</ul>';
  tabPaneHTML += '</div><div class="row pt-3 pb-5"><div class="col-sm-6"><button class="btn btn-link d-none ip-prev-step">&larr; Previous step</button></div><div class="col-sm-6 text-right"><button class="btn btn-primary ip-next-step">Next step &rarr;</button><button class="btn btn-success ip-submit-form d-none">Submit</button></div></div>';

  formContainer.innerHTML += tabListHTML;
  formContainer.innerHTML += tabPaneHTML;
};


let createFormItem = function(input, index){
  let inputId = input.id || 'input-'+index,
      inputRequired = input.isRequired ? 'required' : '',
      inputRequiredClass = input.isRequired ? 'mod-required' : '',
      inputMessage = input.message ? '<small class="form-text text-muted">'+input.message+'</small>' : '',
      inputSize = input.size ? 'col-'+input.size : 'col-sm-12',
      inputHTML = '<div class="'+inputSize+'">';

  switch(input.type) {
    case 'checkbox':
      inputHTML += '<div class="form-group form-check '+inputRequiredClass+'"><input type="checkbox" class="form-check-input" id="'+inputId+'" name="'+inputId+'" '+inputRequired+'><label class="form-check-label" for="'+inputId+'">'+input.label+'</label>';
      break;
    case 'select':
      inputHTML += '<div class="form-group '+inputRequiredClass+'"><label for="'+inputId+'">'+input.label+'</label><select class="form-control" id="'+inputId+'" name="'+inputId+'" '+inputRequired+'>';
      for(let option in input.options){
        inputHTML += "<option value=" + option  + ">" +input.options[option] + "</option>";
      }
      inputHTML += '</select>';
      break;
    case 'textarea':
      inputHTML += '<div class="form-group '+inputRequiredClass+'"><label for="'+inputId+'">'+input.label+'</label><textarea class="form-control" id="'+inputId+'" name="'+inputId+'" placeholder="'+input.placeholder+'" '+inputRequired+'></textarea>';
      break;
    default:
      inputHTML += '<div class="form-group '+inputRequiredClass+'"><label for="'+inputId+'">'+input.label+'</label><input type="'+input.type+'" class="form-control" id="'+inputId+'" name="'+inputId+'" placeholder="'+input.placeholder+'" '+inputRequired+'>';
      break;
  }
  inputHTML += inputMessage+'</div></div>';
  return inputHTML;
};

let buildForm = function(index){
  if( !document.getElementById(window.formLayout[index].form.id) ){
    let paneId = 'ipTab'+window.formLayout[index].title.split(' ')[0],
        formHTML = '<form id="'+window.formLayout[index].form.id+'" class="mt-3"><div class="row">';

    window.formLayout[index].form.fields.forEach(function(input, index){
      formHTML += createFormItem(input, index);
    });
    formHTML += '</div></form>';
    document.getElementById(paneId).innerHTML += formHTML;
  }
};

let parseFormData = function(){
  let formItems = document.querySelectorAll('.form-control, .form-check-input'),
      formData = [];

  formItems.forEach(function(item, index){
    let itemValue = item.value;

    if(itemValue){
      if( item.type == 'checkbox' ){
        if( item.checked ){
          itemValue = 'Yes';
        }else{
          itemValue = 'No';
        }
      }
      let newItem = {
        'label': item.parentNode.querySelector('label').innerHTML,
        'name': item.name,
        'value': itemValue
      };
      formData.push(newItem);
    }
  });
  return formData;
};

let buildFormDetailsList = function(data, selector){
  let membersListHTML = '<ul>';
  data.forEach(function(item, index){
    membersListHTML += '<li>'+item.label+': <strong>'+item.value+'</strong></li>';
  });
  membersListHTML += '</ul>';
  selector.innerHTML = membersListHTML;
};

let validateField = function(input){
  let inputValue = input.value,
      emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      numbersRegEx = /^(0|[1-9][0-9]*)$/,
      setClass = function(input, test){
        if(test){
          input.classList.add('is-valid');
          input.classList.remove('is-invalid');
        }else{
          input.classList.add('is-invalid');
          input.classList.remove('is-valid');
        }
      };

  if(input.required){
    switch(input.type){
      case 'text':
        setClass(input, inputValue.length > 2);
        break;
      case 'textarea':
        setClass(input, inputValue.length > 10);
        break;
      case 'email':
        setClass(input, emailRegEx.test(inputValue));
        break;
      case 'number':
        setClass(input, numbersRegEx.test(inputValue));
        break;
      case 'checkbox':
        setClass(input, input.checked);
        break;
      case 'select-one':
        setClass(input, inputValue);
        break;
      default: 
        break;
    }
  }
};

let validateFields = function(){
  let formItems = document.querySelectorAll('.tab-pane.active .form-control, .tab-pane.active .form-check-input');
  formItems.forEach(function(item, index){
    validateField(item);
    item.addEventListener('keyup', function(){
      if( document.getElementsByClassName('ip-form-validated').length ){
        validateField(item);
      }
    });
    item.addEventListener('input', function(){
      if( document.getElementsByClassName('ip-form-validated').length ){
        validateField(item);
      }
    });
  });
  document.querySelector('.tab-pane.active form').classList.add('ip-form-validated');
};

let bottomNav = function(direction, activeTab){
  let linksLength = document.querySelectorAll('.nav-item').length,
      prevButton = document.querySelector('.ip-prev-step'),
      nextButton = document.querySelector('.ip-next-step'),
      submitButton = document.querySelector('.ip-submit-form');

  if( direction > 0 ){
    prevButton.classList.remove('d-none');
    if( activeTab+2 == linksLength){
      nextButton.classList.add('d-none');
      submitButton.classList.remove('d-none');
    }
  }
  if( direction < 0 ){
    nextButton.classList.remove('d-none');
    submitButton.classList.add('d-none');
    if(activeTab == 1){
      prevButton.classList.add('d-none');
    }
  }
};

let changeTab = function(direction){
  let activeTab = +document.querySelector('.nav-link.active').getAttribute('data-index'),
      tabLinks = document.querySelectorAll('.nav-link'),
      nextLink = document.querySelector('.nav-link[data-index="'+(activeTab+direction)+'"]');

  bottomNav(direction, activeTab);

  tabLinks.forEach(function(link){
    link.classList.remove('active');
  });
  nextLink.classList.remove('disabled');
  nextLink.click();
};

let createModal = function(modalId, modaltitle){
  let modalHTML = '<div class="modal fade" id="'+modalId+'" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">'+modaltitle+'</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body"></div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal">Edit info</button><button type="button" class="btn btn-success ip-complete-order">Complete order</button></div></div></div></div>';
  document.querySelector('#modal-container').innerHTML += modalHTML;
};


let xhr = new XMLHttpRequest();
xhr.open('GET', 'json/data.json');
xhr.onreadystatechange = function(){
  if(xhr.readyState == xhr.DONE){
    if(xhr.status == 200){
      window.formLayout = JSON.parse(xhr.response);
      buildTabs(window.formLayout);
      buildForm(0);
    }
  }
};
xhr.send();

document.addEventListener('click', function(e){
  if(e.target.classList.value.indexOf('ip-next-step') != -1){
    e.preventDefault();
    let activeTab = document.querySelector('.nav-link.active').getAttribute('data-index');
    validateFields();
    if( !document.querySelectorAll('.tab-pane.active .is-invalid').length ){
      changeTab(1);
      buildForm(++activeTab);
    }
  }

  if(e.target.classList.value.indexOf('ip-prev-step') != -1){
    e.preventDefault();
    changeTab(-1);
  }

  if(e.target.classList.value.indexOf('ip-submit-form') != -1){
    e.preventDefault();
    if( !document.querySelectorAll('.tab-pane.active .is-invalid').length ){
      createModal('formModal', 'Summary');
      buildFormDetailsList(parseFormData(), document.querySelector('#formModal .modal-body'));
      // More jQuery for God of jQuery
      $('#formModal').modal('show');
    }
  }

  if(e.target.classList.value.indexOf('ip-complete-order') != -1){
    e.preventDefault();
    
    let xhr = new XMLHttpRequest();
    xhr.open('POST', '/endpoint');
    xhr.onreadystatechange = function(){
      if(xhr.readyState == xhr.DONE){
        // Just imagine that server responds with 200 everytime
        document.querySelector('#formModal .modal-title').innerHTML = 'Thank you!';
        document.querySelector('#formModal .modal-body').innerHTML = '<p>Thanks for your order, we\'ll contact you shortly.<br>You can check your <a href="/">order status here</a>. </p>';
        document.querySelector('#formModal .modal-footer').classList.add('d-none');
      }
    };
    xhr.send(JSON.stringify(parseFormData()));
  }
});