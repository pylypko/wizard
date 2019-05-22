/* jshint esversion:6 */
import "../styles/index.scss";

import "popper.js";
import modal from "bootstrap";

// New Element constructor
// ul / myTab / nav nav-tabs / role=tablist
const newc = (
  nodeName = null,
  elementId = null,
  elementClasses = null,
  attributes = null
) => {
  const element = !!nodeName && document.createElement(nodeName);
  if (element) {
    const classListArr = !!elementClasses && elementClasses.split(" ");
    if (!!elementId) element.id = elementId;
    for (const elementClass in classListArr) {
      classListArr[elementClass] !== "" &&
        element.classList.add(classListArr[elementClass]);
    }
    for (let attribute in attributes) {
      element.setAttribute(attribute, attributes[attribute]);
    }
  } else {
    throw `You've missed nodeName to create new element - nodeName = ${nodeName}`;
  }
  return element;
};
// XHR Helper
function handleBodyContentType(request) {
  const contentType = request.getResponseHeader("Content-Type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return request.response;
    } catch (e) {
      console.warn(e); //
      return {};
    }
  } else {
    console.log(`We don't handle this response type yet ${contentType}`);
    return request.response;
  }
}

(function formBuilderInit() {
  let formData;
  const buildTabs = function() {
    const formContainer = document.getElementById("form-container");
    let tabListHTML = newc("ul", "myTab", "nav nav-tabs", {
      role: "tablist",
      "data-demo": true
    });
    let tabPaneHTML = newc("div", null, "tab-content", null);
    formData.forEach(function(item, index) {
      let tabId = "ipTab" + item.title.split(" ")[0],
        activeTab = !index ? "active" : "disabled";
      const tabListItem = newc("li", null, "nav-item");
      const listItemChildAttributes = {
        "role": "tab",
        "data-toggle": "tab",
        "href": `#${tabId}`,
        "data-index": index,
      };

      const tabListItemChild = newc(
        "a",
        null,
        `nav-link ${activeTab}`,
        listItemChildAttributes
      );
      tabListItemChild.innerText = item.title;
      tabListItem.appendChild(tabListItemChild);
      // Ofc. we can also add to newc function to append html or text
      // but we don't want to over-helm that function
      // we could create another one and pass as callback
      tabListHTML.appendChild(tabListItem);
      tabPaneHTML.appendChild(
        newc(
          "div",
          tabId,
          `tab-pane pt-3 ${activeTab}`
        )
      ).innerText = item.description;
    });
    formContainer.appendChild(tabListHTML);
    formContainer.appendChild(tabPaneHTML);

    // TabPane default bottom elements
    // tab controls
    const tabControls = newc("div", null, "row pt-3 pb-5");
    formContainer.appendChild(tabControls);
    tabControls.innerHTML = '<div class="col-sm-6"><button class="btn btn-link d-none ip-prev-step">&larr; Previous step</button></div><div class="col-sm-6 text-right"><button class="btn btn-primary ip-next-step">Next step &rarr;</button><button class="btn btn-success ip-submit-form d-none" data-target="#formModal">Submit</button></div>';

    buildForm(0);
  }; // as a result we can return any element or set it to init scope and operate with it

  let createFormItem = function(input, index) {
    let inputId = input.id || "input-" + index,
      inputRequired = input.isRequired ? "required" : "",
      inputRequiredClass = input.isRequired ? "mod-required" : "",
      inputSize = input.size ? "col-" + input.size : "col-sm-12",
      inputWrapper = newc("div", null, inputSize),
      inputMessage = newc("small", null, "form-text text-muted");

    const composedElementWrapper = newc(
      "div",
      null,
      `form-group ${
        input.type === "checkbox" ? "form-check" : ""
      } ${inputRequiredClass}`
    );

    function handleType(type) {
      switch (type) {
        case "checkbox":
        case "email":
        case "number":
        case "text":
          return "input";
        default:
          return type;
      }
    }

    const handledType = handleType(input.type);

    const { type, placeholder } = input;

    const label = newc(
      "label",
      null,
      `${type === "checkbox" ? "form-check-label" : ""}`,
      {
        for: inputId
      }
    );

    if (type !== "checkbox") {
      composedElementWrapper.appendChild(label); // input.label
    }
    const inputAttributes = 
    {
      type,
      id: inputId,
      name: inputId,
    };
    if(placeholder) {
      inputAttributes.placeholder = placeholder;
    }
    if (inputRequired) {
      inputAttributes.required = inputRequired;
    }
    const inputElement = newc(
      handledType,
      null,
      `${
        type === "checkbox" ? "form-check-input" : "form-control"
      } ${inputRequiredClass}`,
      inputAttributes
    );
    composedElementWrapper.appendChild(inputElement);

    if (input.type === "select") {
      for (let option in input.options) {
        const optionElement = newc("option", null, null, { value: option });
        optionElement.innerText = input.options[option];
        inputElement.appendChild(optionElement);
      }
    }
    if (type === "checkbox") {
      composedElementWrapper.appendChild(label); // input.label
    }
    composedElementWrapper.appendChild(inputMessage).innerText = input.message; // input.label
    label.innerHTML = input.label;

    inputWrapper.appendChild(composedElementWrapper);

    return inputWrapper;
  };

  let buildForm = function(index) {
    const formId = formData[index].form.id;
    if (!document.getElementById(formData[index].form.id)) {
      let paneId = "ipTab" + formData[index].title.split(" ")[0],
        form = newc("form", formId, "mt-3"),
        formRow = form.appendChild(newc("div", null, "row"));
      formData[index].form.fields.forEach(function(input, index) {
        formRow.appendChild(createFormItem(input, index));
      });
      document.getElementById(paneId).appendChild(form);
    }
  };

  let parseFormData = function() {
    let formItems = document.querySelectorAll(
        ".form-control, .form-check-input"
      ),
      formData = [];

    formItems.forEach(function(item, index) {
      let itemValue = item.value;

      if (itemValue) {
        if (item.type == "checkbox") {
          if (item.checked) {
            itemValue = "Yes";
          } else {
            itemValue = "No";
          }
        }
        let newItem = {
          label: item.parentNode.querySelector("label").innerHTML,
          name: item.name,
          value: itemValue
        };
        formData.push(newItem);
      }
    });
    return formData;
  };

  let buildFormDetailsList = function(data, selector) {
    let membersListHTML = "<ul>";
    data.forEach(function(item, index) {
      membersListHTML +=
        "<li>" + item.label + ": <strong>" + item.value + "</strong></li>";
    });
    membersListHTML += "</ul>";
    selector.innerHTML = membersListHTML;
  };

  let validateField = function(input) {
    let inputValue = input.value,
      emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      numbersRegEx = /^(0|[1-9][0-9]*)$/,
      setClass = function(input, test) {
        if (test) {
          input.classList.add("is-valid");
          input.classList.remove("is-invalid");
        } else {
          input.classList.add("is-invalid");
          input.classList.remove("is-valid");
        }
      };

    if (input.required) {
      switch (input.type) {
        case "text":
          setClass(input, inputValue.length > 2);
          break;
        case "textarea":
          setClass(input, inputValue.length > 10);
          break;
        case "email":
          setClass(input, emailRegEx.test(inputValue));
          break;
        case "number":
          setClass(input, numbersRegEx.test(inputValue));
          break;
        case "checkbox":
          setClass(input, input.checked);
          break;
        case "select-one":
          setClass(input, inputValue);
          break;
        default:
          break;
      }
    }
  };

  let validateFields = function() {
    let formItems = document.querySelectorAll(".tab-pane.active .form-control, .tab-pane.active .form-check-input");
    formItems.forEach(function(item, index) {
      validateField(item);
      item.addEventListener("keyup", function() {
        if (document.getElementsByClassName("ip-form-validated").length) {
          validateField(item);
        }
      });
      item.addEventListener("input", function() {
        if (document.getElementsByClassName("ip-form-validated").length) {
          validateField(item);
        }
      });
    });
    document.querySelector(".tab-pane.active form").classList.add("ip-form-validated");
  };

  let bottomNav = function(direction, activeTab) {
    let linksLength = document.querySelectorAll(".nav-item").length,
      prevButton = document.querySelector(".ip-prev-step"),
      nextButton = document.querySelector(".ip-next-step"),
      submitButton = document.querySelector(".ip-submit-form");

    if (direction > 0) {
      prevButton.classList.remove("d-none");
      if (activeTab + 2 == linksLength) {
        nextButton.classList.add("d-none");
        submitButton.classList.remove("d-none");
      }
    }
    if (direction < 0) {
      nextButton.classList.remove("d-none");
      submitButton.classList.add("d-none");
      if (activeTab == 1) {
        prevButton.classList.add("d-none");
      }
    }
  };

  let changeTab = function(direction) {
    let activeTab = +document.querySelector(".nav-link.active").getAttribute("data-index"),
        tabLinks = document.querySelectorAll(".nav-link"),
        nextLink = document.querySelector('.nav-link[data-index="' + (activeTab + direction) + '"]');

    bottomNav(direction, activeTab);
    tabLinks.forEach(function(link) {
      link.classList.remove("active");
    });
    nextLink.classList.remove("disabled");
    nextLink.click();
  };

  let createModal = function(modalId, modaltitle, ariaLabel) {
    if( !document.getElementById(modalId) ){
      const modalContainer = document.querySelector("#modal-container"),
            modalWrapper = newc("div", modalId, "modal fade", {
              role: "dialog",
              "aria-labelledby": ariaLabel,
              "aria-hidden": true
            }),
            modalDialog = newc("div", null, "modal-dialog", {role: "document"}),
            modalContent = newc("div", null, "modal-content"),
            modalHeader = newc("div", null, "modal-header"),
            modalHeaderTitle = newc("h5", null, "modal-title"),
            modalCloseButton = newc("button", null, "close", {
              "type": "button",
              "data-dismiss": "modal",
              "aria-label": "Close"
            }),
            modalBody = newc("div", null, "modal-body"),
            modalFooter = newc("div", null, "modal-footer"),
            modalTriggerButton = newc("button", null, "btn invisible", {
              "data-toggle": "modal",
              "data-target": "#"+modalId
            });
    
      modalHeaderTitle.innerHTML = modaltitle;
      modalCloseButton.innerHTML = '<span aria-hidden="true">&times;</span>';
      modalFooter.innerHTML = '<button type="button" class="btn btn-secondary" data-dismiss="modal">Edit info</button><button type="button" class="btn btn-success ip-complete-order">Complete order</button>';

      modalHeader.appendChild(modalHeaderTitle);
      modalHeader.appendChild(modalCloseButton);
      modalContent.appendChild(modalHeader);
      modalContent.appendChild(modalBody);
      modalContent.appendChild(modalFooter);
      modalDialog.appendChild(modalContent);
      modalWrapper.appendChild(modalDialog);
      modalWrapper.appendChild(modalTriggerButton);

      modalContainer.appendChild(modalWrapper);
    }
  };

  let xhr = new XMLHttpRequest();
  xhr.open("GET", "json/data.json");
  xhr.setRequestHeader("Accept", "application/json"); // This will return in response json
  xhr.responseType = "json"; // This will return in response json
  xhr.onreadystatechange = function() {
    if (xhr.readyState == xhr.DONE && xhr.status == 200) {
      formData = handleBodyContentType(xhr);
      buildTabs();
    }
  };
  xhr.send();

  document.addEventListener("click", function(e) {
    if (e.target.classList.value.indexOf("ip-next-step") != -1) {
      e.preventDefault();
      let activeTab = document.querySelector(".nav-link.active").getAttribute("data-index");
      validateFields();
      if (!document.querySelectorAll(".tab-pane .is-invalid").length) {
        changeTab(1);
        buildForm(++activeTab);
      }
    }

    if (e.target.classList.value.indexOf("ip-prev-step") != -1) {
      e.preventDefault();
      changeTab(-1);
    }

    if (e.target.classList.value.indexOf("ip-submit-form") != -1) {
      e.preventDefault();
      if (!document.querySelectorAll(".tab-pane.active .is-invalid").length) {
        createModal("formModal", "Summary", "formModalLabel");
        buildFormDetailsList(
          parseFormData(),
          document.querySelector("#formModal .modal-body")
        );
        let modalButton = document.querySelector('.invisible[data-target="#formModal"]');
        modalButton.click();
      }
    }

    if (e.target.classList.value.indexOf("ip-complete-order") != -1) {
      e.preventDefault();

      let xhr = new XMLHttpRequest();
      xhr.open("POST", "/endpoint");
      xhr.onreadystatechange = function() {
        if (xhr.readyState == xhr.DONE) {
          // Just imagine that server responds with 200 everytime
          document.querySelector("#formModal .modal-title").innerHTML = "Thank you!";
          document.querySelector("#formModal .modal-body").innerHTML = '<p>Thanks for your order, we\'ll contact you shortly.<br>You can check your <a href="/">order status here</a>. </p>';
          document.querySelector("#formModal .modal-footer").classList.add("d-none");
        }
      };
      xhr.send(JSON.stringify(parseFormData()));
    }
  });
})();