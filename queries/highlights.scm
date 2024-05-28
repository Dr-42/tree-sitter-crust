;; highlights.scm

; Highlighting rules for crust

;; Keywords
[
  (type_alias) @keyword
  (while) @keyword
  (for) @keyword
  (if) @keyword
  (else) @keyword
  (ret) @keyword
  (cont) @keyword
  (brk) @keyword
  (struct) @keyword
  (fnc) @keyword
  (trait) @keyword
  (impl) @keyword
]

;; Types
[
  (builtin_type) @type
  (pointer) @type
  (fnptr) @type
  (array) @type
  (user_defined) @type
]

;; Literals
[
  (numeric) @number
  (strng) @string
  (flt) @number
  (chr) @character
  (bln) @boolean
]

;; Identifiers
[
  (iden) @variable
]

;; Operators
[
  (unary_op) @operator
  (binary_op) @operator
]

;; Punctuation
[
  "[" @punctuation.bracket
  "]" @punctuation.bracket
  "{" @punctuation.bracket
  "}" @punctuation.bracket
  "(" @punctuation.bracket
  ")" @punctuation.bracket
  ";" @punctuation.delimiter
  "," @punctuation.delimiter
  "." @punctuation.delimiter
]

;; Function calls and declarations
[
  (call) @function.call
  (fn_decl (iden) @function)
  (fn_decl (block) @function)
]

;; Variables and Assignments
[
  (var_decl (iden) @variable.builtin)
  (var_assign (iden) @variable.builtin)
  (deref_assign (unary_op) @variable.builtin)
  (struct_assign (iden) @variable.builtin)
  (struct_member_assign (member_access) @property)
  (array_member_assign (index) @variable)
]

;; Control flow
[
  (stmt) @statement
  (block) @block
]

;; Comments (add this rule if your language supports comments)
;; For example, assuming `//` starts a comment:
;; [
;;   (comment) @comment
;; ]
