module.exports = grammar({
  name: 'crust',

  rules: {
    program: $ => repeat1($.stmt),

    stmt: $ => choice(
      seq($.var_decl, ';'),
      seq($.expr, ';'),
      $.type_alias,
      $.while,
      $.block,
      $.for,
      $.if,
      $.return,
      $.break,
      $.continue,
      $.struct_decl,
      $.enum_decl,
      $.fn_decl,
      $.trait_decl,
      $.var_assign,
      $.deref_assign,
      $.struct_assign,
      $.struct_member_assign,
      $.array_member_assign,
      $.trait_assign,
      $.match,
    ),

    type_alias: $ => seq('type', $.type, "is", $.iden, ';'),

    atom: $ => choice(
      $.numeric,
      $.strng,
      $.flt,
      $.chr,
      $.bln,
      $.iden,
      $.index,
      $.call,
      $.member_access,
    ),

    bracketed: $ => seq('(', $.expr, ')'),

    expr: $ => choice(
      prec.left(1, $.bracketed),
      prec.left(2, $.atom),
      prec.left(3, $.unary_op),
      prec.left(4, $.binary_op),
      prec.left(5, $.array_literal),
      prec.left(6, $.enum_literal),
    ),

    numeric: $ => token(/[0-9]+/),
    strng: $ => token(/"[^"]*"/),
    flt: $ => token(/[0-9]+\.[0-9]+/),
    chr: $ => token(/'.'/),
    bln: $ => choice('true', 'false'),
    iden: $ => /[a-zA-Z_][a-zA-Z0-9_]*/,

    op_inp: $ => choice(
      prec(1, $.atom),
      prec(2, $.unary_op),
      prec(3, $.bracketed),
    ),

    unary_op: $ => choice(
      prec(1, seq('--', $.op_inp)),
      prec(2, seq('++', $.op_inp)),
      prec(3, seq('&', $.op_inp)),
      prec(4, seq('*', $.op_inp)),
      prec(5, seq('+', $.op_inp)),
      prec(6, seq('-', $.op_inp)),
      prec(7, seq('!', $.op_inp)),
      prec(8, seq('~', $.op_inp)),
    ),

    binary_op: $ => choice(
      prec.left(1, seq($.expr, '*', $.expr)),
      prec.left(2, seq($.expr, '/', $.expr)),
      prec.left(3, seq($.expr, '%', $.expr)),
      prec.left(4, seq($.expr, '+', $.expr)),
      prec.left(5, seq($.expr, '-', $.expr)),
      prec.left(6, seq($.expr, '<<', $.expr)),
      prec.left(7, seq($.expr, '>>', $.expr)),
      prec.left(8, seq($.expr, '<', $.expr)),
      prec.left(9, seq($.expr, '<=', $.expr)),
      prec.left(10, seq($.expr, '>', $.expr)),
      prec.left(11, seq($.expr, '>=', $.expr)),
      prec.left(12, seq($.expr, '==', $.expr)),
      prec.left(13, seq($.expr, '!=', $.expr)),
      prec.left(14, seq($.expr, '&', $.expr)),
      prec.left(15, seq($.expr, '^', $.expr)),
      prec.left(16, seq($.expr, '|', $.expr)),
      prec.left(17, seq($.expr, '&&', $.expr)),
      prec.left(18, seq($.expr, '||', $.expr)),
    ),

    array_literal: $ => choice(
      seq('[', ']'),
      seq('[', $.expr, repeat1(seq(',', $.expr)), ']'),
    ),

    enum_literal: $ => seq($.iden, '::', $.iden),

    call: $ => choice(
      seq($.iden, '(', ')'),
      seq($.iden, '(', repeat1(seq($.expr, ',')), ')'),
    ),

    index: $ => seq($.iden, repeat1(seq('[', $.expr, ']'))),

    mem_access_operands: $ => choice(
      $.numeric,
      $.strng,
      $.flt,
      $.chr,
      $.bln,
      $.iden,
      $.index,
      $.call,
    ),

    member_access: $ => seq($.mem_access_operands, repeat1(seq('.', $.iden))),

    type: $ => choice(
      prec.left(1, $.builtin_type),
      prec.left(2, $.pointer),
      prec.left(3, $.fnptr),
      prec.left(4, $.user_defined),
      prec.left(5, $.array),
    ),

    builtin_type: $ => choice(
      'i8',
      'i16',
      'i32',
      'i64',
      'u8',
      'u16',
      'u32',
      'u64',
      'f32',
      'f64',
      'void',
      'chr',
      'bln',
      'str',
      'Self',
    ),

    pointer: $ => prec.left(1, seq(repeat1('*'), $.type)),

    fnptr: $ => choice(
      seq('fnptr', '<', "(", ")", ":", $.type, '>'),
      seq('fnptr', '<', $.type, "(", repeat1(seq($.type, ',')), ")", ":", $.type, '>'),
    ),

    array: $ => seq('[', $.type, repeat1(seq(';', $.numeric)), ']'),

    user_defined: $ => choice(
      $.iden,
      seq($.iden, '<', $.type, repeat(seq(',', $.type)), '>'),
    ),

    qualifier: $ => choice(
      'const',
      'static',
    ),

    qualifiers: $ => repeat1($.qualifier),

    var_decl: $ => choice(
      seq(optional($.qualifiers), $.iden, ':', $.type, '=', $.expr),
      seq(optional($.qualifiers), $.iden, ':', $.type),
    ),

    block: $ => seq('{', repeat($.stmt), '}'),

    while: $ => seq('while', '(', $.expr, ')', $.stmt),

    for: $ => seq('for', '(', $.stmt, $.expr, ';', $.stmt, ')', $.stmt),

    valid_if_tail: $ => choice(
      $.block,
      seq($.expr, ';'),
      $.return,
      $.break,
      $.continue,
    ),

    if: $ => choice(
      seq('if', '(', $.expr, ')', $.valid_if_tail),
      seq('if', '(', $.expr, ')', $.valid_if_tail, 'else', $.stmt),
    ),

    return: $ => seq('ret', optional($.expr), ';'),
    continue: $ => seq('cont', ';'),
    break: $ => seq('brk', ';'),

    generic_type: $ => choice(
      $.iden,
      seq($.iden, ":", $.type, repeat(seq('+', $.type))),
    ),

    generic_decl: $ => seq($.generic_type, repeat(seq($.generic_type, ','))),

    struct_decl: $ => choice(
      seq('struct', $.iden, '{', $.var_decl, repeat(seq($.var_decl, ',')), '}'),
      seq('struct', $.iden, '<', $.generic_decl, '>', '{', $.var_decl, repeat(seq($.var_decl, ',')), '}'),
    ),

    enum_decl: $ => seq('enum', $.iden, '{', $.iden, repeat(seq(',', $.iden)), '}'),

    fn_decl: $ => choice(
      seq('fnc', $.iden, '(', ')', ':', $.type, $.block),
      seq('fnc', $.iden, '(', repeat1(seq($.var_decl, ',')), ')', ':', $.type, $.block),
      seq('fnc', $.iden, '<', $.generic_decl, '>', '(', ')', ':', $.type, $.block),
      seq('fnc', $.iden, '<', $.generic_decl, '>', '(', repeat1(seq($.var_decl, ',')), ')', ':', $.type, $.block),
      seq('fnc', $.iden, '(', repeat1(seq($.var_decl, ',')), '...', ')', ':', $.type, $.block),
      seq('fnc', $.iden, '<', $.generic_decl, '>', '(', repeat1(seq($.var_decl, ',')), '...', ')', ':', $.type, $.block),
      seq('fnc', $.iden, '(', ')', ':', $.type, ';'),
      seq('fnc', $.iden, '(', repeat1(seq($.var_decl, ',')), ')', ':', $.type, ';'),
      seq('fnc', $.iden, '<', $.generic_decl, '>', '(', ')', ':', $.type, ';'),
      seq('fnc', $.iden, '<', $.generic_decl, '>', '(', repeat1(seq($.var_decl, ',')), ')', ':', $.type, ';'),
      seq('fnc', $.iden, '(', repeat1(seq($.var_decl, ',')), '...', ')', ':', $.type, ';'),
      seq('fnc', $.iden, '<', $.generic_decl, '>', '(', repeat1(seq($.var_decl, ',')), '...', ')', ':', $.type, ';'),
    ),

    trait_decl: $ => seq('trait', $.iden, '{', repeat1($.fn_decl), '}'),

    var_assign: $ => choice(
      seq($.iden, '=', $.expr, ';'),
      seq($.iden, '+=', $.expr, ';'),
      seq($.iden, '-=', $.expr, ';'),
      seq($.iden, '*=', $.expr, ';'),
      seq($.iden, '/=', $.expr, ';'),
      seq($.iden, '%=', $.expr, ';'),
    ),

    deref_assign: $ => choice(
      seq($.unary_op, '=', $.expr, ';'),
      seq($.unary_op, '+=', $.expr, ';'),
      seq($.unary_op, '-=', $.expr, ';'),
      seq($.unary_op, '*=', $.expr, ';'),
      seq($.unary_op, '/=', $.expr, ';'),
      seq($.unary_op, '%=', $.expr, ';'),
    ),

    name_val: $ => seq($.iden, '=', $.expr),

    struct_assign: $ => choice(
      seq(optional($.qualifiers), $.iden, ':', $.type, '=', '{', $.name_val, repeat(seq(',', $.name_val)), '}'),
      seq($.iden, '=', '{', $.name_val, repeat(seq(',', $.name_val)), '}'),
    ),

    struct_member_assign: $ => choice(
      seq($.member_access, '=', $.expr, ';'),
      seq($.member_access, '+=', $.expr, ';'),
      seq($.member_access, '-=', $.expr, ';'),
      seq($.member_access, '*=', $.expr, ';'),
      seq($.member_access, '/=', $.expr, ';'),
      seq($.member_access, '%=', $.expr, ';'),
    ),

    array_member_assign: $ => choice(
      seq($.index, '=', $.expr, ';'),
      seq($.index, '+=', $.expr, ';'),
      seq($.index, '-=', $.expr, ';'),
      seq($.index, '*=', $.expr, ';'),
      seq($.index, '/=', $.expr, ';'),
      seq($.index, '%=', $.expr, ';'),
    ),

    trait_assign: $ => seq('impl', $.iden, 'for', $.type, '{', repeat1($.fn_decl), '}'),

    match: $ => seq('match', '(', $.expr, ')', '{', repeat1($.match_case), '}'),

    match_case: $ => seq($.expr, '=>', $.stmt),

    comment: $ =>
      token(/\/\/.*/),
  }
});
